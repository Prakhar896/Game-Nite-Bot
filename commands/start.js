const Discord = require('discord.js')
require('dotenv').config();

module.exports = {
    name: 'start',
    description: 'Starts participation list with which people react to a message to enter game nite.',
    async execute(msg, args, Prefix, bot, Discord, currentParticipants) {
        if (!msg.author.hasPermission('ADIMINISTRATOR')) return msg.reply(`:negative_squared_cross_mark: You do not have Admin permissions.`)

    }
}