require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const app = express();
const PORT = process.env.PORT || 5000;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages] });
const userData = require('./models/user')
const mongoose = require('mongoose');
app.use(express.json());

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log(`🌐 Servidor webhook rodando na porta ${PORT}`);
    console.log(`📊 Pronto para receber webhooks do Top.gg!`);
});

app.post('/webhook', async (req, res) => {
    const auth = req.headers['authorization'];
    if (auth !== process.env.TOPGG_AUTH) {
        console.log('❌ Tentativa de webhook não autorizada');
        return res.status(401).json({ error: 'Não autorizado' });
    }

    const voteData = req.body;
    console.log('🗳️ Novo voto recebido:', voteData);

    try {
        const userId = voteData.user;
        const isWeekend = voteData.isWeekend || false;
        const user = await client.users.fetch(userId).catch(() => null);
        const userName = user ? user.tag : userId; console.log(`👤 Usuário que votou: ${userName}`);
        if (process.env.DISCORD_CHANNEL_ID) {
            const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID).catch(() => null);

            if (channel && channel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setColor('#FF3366')
                    .setTitle('🎉 Novo Voto Recebido!')
                    .setDescription('Obrigado por votar no nosso bot!')
                    .addFields({ name: '👤 Usuário', value: userName, inline: true },
                        { name: '📅 Fim de semana?', value: isWeekend ? 'Sim (voto em dobro!)' : 'Não', inline: true })
                    .setTimestamp().setFooter({ text: 'Top.gg Webhook' });

                await channel.send({ embeds: [embed] });
                console.log('✅ Mensagem enviada no canal do Discord');
            }
        }

        if (user) {
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✨ Obrigado por votar!')
                    .setDescription(`Seu voto foi registrado com sucesso! Agradecemos muito seu apoio. 💚 \n E como agradecimento te darei 500 whiskers!`)
                    .setTimestamp(); await user.send({ embeds: [dmEmbed] });
                console.log('✅ DM de agradecimento enviada ao usuário'); // dar recompensa de 500 whiskers ao usuário 
                const userDB = await userData.findOne({ id: userId });
                if (userDB) {
                    userDB.whiskers += 500;
                } else {
                    await userData.create({ id: userId, whiskers: 500 });
                }
                await userDB.save();
            } catch (error) {
                console.log('⚠️ Não foi possível enviar DM ao usuário (DMs podem estar desabilitadas)');
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('❌ Erro ao processar voto:', error);
        res.status(500).json({ error: 'Erro ao processar voto' });
    }
});

app.get('/', (req, res) => {
    res.send('Bot do Discord - Webhook do Top.gg está rodando! ✅');
}); 

app.listen(PORT, '0.0.0.0', () => { console.log(`🚀 Servidor webhook iniciado na porta ${PORT}`); }); 
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Erro ao fazer login no Discord:', error.message);
    console.log('⚠️ Verifique se o DISCORD_TOKEN está correto no arquivo .env');
});
mongoose.connect(process.env.mongoUrl).then(() => {
    console.log('✅ Conectado ao banco de dados MongoDB');
}).catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
});