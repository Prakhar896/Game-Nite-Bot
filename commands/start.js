const Discord = require('discord.js')
require('dotenv').config();

module.exports = {
    name: 'startnite',
    description: 'Starts participation list with which people react to a message to enter game nite.',
    async execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite) {
        if (!msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) return msg.reply(`:negative_squared_cross_mark: You do not have Admin permissions.`)
        if (activeNite) return msg.reply('Sorry, a Nite event is already active. Please de-activate the current Nite event before starting a new one.')
        var channelID = args[1]
        if (!channelID) return msg.reply('Please give the channel in which the reaction list message is to be sent.')

        //Help Embed
        if (channelID == 'help') {
            let helpEmbed = new Discord.MessageEmbed()
                .setTitle('StartNite Participation Entry List Help')
                .setDescription('This command creates a message that members can react to get a role to gain access to Game Nite channels.')
                .addField('Usage:', `${Prefix}startnite #<name of channel where message is to be sent>`)
                .setColor('GREEN');
            msg.channel.send(helpEmbed)
            return
        }

        //Checks
        if (!channelID.startsWith('<#')) return msg.reply('Please give a proper channel.')
        channelID = channelID.substring(2, (channelID.length - 1))
        if (!msg.guild.channels.cache.get(channelID)) return msg.reply('Please give a proper channel.')

        //Copy of currentParticipants array
        var newCurrentParticipants = currentParticipants
        //Sending message and reacting to message
        var channel = msg.guild.channels.cache.get(channelID)
        var reactiveMessage = await channel.send('**New Game Nite! Please react with :thumbsup: below to participate on this new Game Nite!**')
        await reactiveMessage.react('👍🏻')
            .then(() => {
                msg.channel.send(`Successfully created reaction participation list message in <#${channelID}>`)
            })
            .catch(err => {
                msg.channel.send('An error occurred in creating the message.')
                console.log('Error in Reacting to Message: ' + err)
            })
        return reactiveMessage.id
    }
}