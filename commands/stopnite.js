const Discord = require('discord.js')
require('dotenv').config();

module.exports = {
    name: 'stopnite',
    description: 'Stops participation list with which people react to a message to enter game nite.',
    async execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, db, updateDatabase, deleteAllKeys) {
        if (!msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) return msg.reply(`:negative_squared_cross_mark: You do not have Admin permissions.`)
        if (!activeNite) return msg.reply('Sorry, no Nite events are currently active for you to stop.')

        //Remove nite role from all Niters
        currentParticipants.forEach(person => {
            try {
                let userAsMember = msg.guild.member(person.id)
                if (!userAsMember) msg.reply(`Sorry, could not remove the Nite role from \`${person.name}\`. Please ensure I have Administrator permissions.`)
                const niteRole = msg.guild.roles.cache.find(r => r.id == '852508346216218644' || r.id === '852394228381909005')
                if (!niteRole) return msg.reply('Sorry, could not find the Nite role in this server.')
                userAsMember.roles.remove(niteRole)
                    .catch(err => {
                        msg.reply(`Sorry, an error occurred in removing the Nite role from ${userAsMember.nickname}.`)
                        console.log(`Error occurred in removing role from ${userAsMember.nickname}: ` + err)
                    })
            } catch (err) {
                console.log('Error occurred in removing roles from participants in stopnite: ' + err)
                msg.reply('Sorry, failed to remove Nite role from all participating Niters.')
                return
            }
        })

        msg.reply('Successfully stopped the Nite event!')
        return true
    }
}