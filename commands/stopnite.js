const Discord = require('discord.js')
require('dotenv').config();

module.exports = {
    name: 'stopnite',
    description: 'Starts participation list with which people react to a message to enter game nite.',
    async execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite) {
        if (!msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) return msg.reply(`:negative_squared_cross_mark: You do not have Admin permissions.`)
        if (!activeNite) return msg.reply('Sorry, no Nite events are currently active for you to stop.')
        msg.reply('Successfully stopped the Nite event!')
        return true
    }
}