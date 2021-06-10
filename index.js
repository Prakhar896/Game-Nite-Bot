//Import statements
const Discord = require('discord.js')
require('dotenv').config();
const bot = new Discord.Client()

//Bot Stuff
const token = process.env.DISCORD_TOKEN
const Prefix = process.env.PREFIX

//Variables
var currentParticipants = []

bot.on('ready', () => {
    console.log('Game Nite Bot is online!')
})

bot.on('message', msg => {
    if (!msg.content.startsWith(Prefix)) return
    let args = msg.content.substring(Prefix.length).split(' ')
    if (msg.guild.id != '807599800379768862' || msg.guild.id != '805723501544603658') return msg.channel.send('Sorry, I only function in specific guiilds.')

    switch (args[0]) {
        case 'start':

    }
})

bot.login(token)