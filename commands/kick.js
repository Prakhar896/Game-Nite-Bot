const Discord = require('discord.js')
require('dotenv').config();

module.exports = {
    name: 'kick',
    description: 'Kicks participant from current Nite event.',
    async execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, reactiveMessageID) {
        if (!msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) return msg.reply(`:negative_squared_cross_mark: You do not have Admin permissions.`)
        if (!activeNite) return msg.reply('Sorry, no Nite events for you to kick participants from.')

        let memberToKick = msg.mentions.users.first()
        if (!memberToKick) return msg.reply('Please mention a member to kick from participants.')

        let userAsMember = msg.guild.member(memberToKick)
        if (!userAsMember) return msg.reply('That user does not exist in this server.')

        var verified = false
        //check if user is in participating list
        currentParticipants.forEach(participant => {
            if (participant.id == memberToKick.id) {
                verified = true
            }
        })
        var newParticipants;
        //remove role from user
        if (verified) {
            try {
                let niteRole = msg.guild.roles.cache.find(r => r.id === '852394228381909005' || r.id === '852508346216218644')
                if (!niteRole) return msg.reply('Sorry, I could not locate the Nite role and remove it form the user.')
                userAsMember.roles.remove(niteRole)
                    .catch(err => {
                        console.log('Error in removing role from user using remove method: ' + err)
                    })
            } catch (err) {
                console.log('Error in removing role from user: ' + err)
            }
            newParticipants = participantRemove(currentParticipants, userAsMember.id)

            //Edit message and remove name
            var reactiveMessage = msg.channel.messages.cache.get(reactiveMessageID)
            if (!reactiveMessage) return msg.reply('COuld not get reactive message. Please ensure you are using this command in the channel which has the reactive message.')
            var newContent = '**New Game Nite! Please react with :thumbsup: below to participate on this new Game Nite!**'
            var count = 1
            newParticipants.forEach(person => {
                newContent += `\n ${count}. ${person.name}`
                count += 1
            })
            reactiveMessage.edit(newContent)
                .catch(err => {
                    console.log('Error occurred in editing (add) message: ' + err)
                })

            //Finalisation message
            msg.reply(`Successfully kicked <@${userAsMember.id}>!`)
        }

        return newParticipants
    }
}

function participantRemove(array, idOfUser) {
    var newArray = array.filter(function (ele) {
        return ele.id != idOfUser;
    })
    return newArray
}