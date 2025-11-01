// logar bot
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.token);

// receber votos do top.gg
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.post('/webhook', (req, res) => {
    // Aqui você pode processar os dados do voto recebidos no corpo da requisição
    console.log('Voto recebido:', req.body);
    res.status(200).send('Voto recebido com sucesso!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});