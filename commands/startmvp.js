const Discord = require('discord.js')
const discord_emoji_converter = require('discord-emoji-converter')
require('dotenv').config();

module.exports = {
    name: 'startmvp',
    description: 'Starts voting for an MVP from the Nite event.',
    async execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite) {
        if (!msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) return msg.reply(`:negative_squared_cross_mark: You do not have Admin permissions.`)
        if (!activeNite) return msg.reply('Sorry, no Nite events are currently active for you to start MVP voting on.')

        // Check for channel
        /// presence
        var channelID = args[1]
        if (!channelID) return msg.reply('Please give the channel in which the MVP voting message is to be sent.')

        ///validity
        if (!channelID.startsWith('<#')) return msg.reply('Please give a proper channel.')
        channelID = channelID.substring(2, (channelID.length - 1))
        if (!msg.guild.channels.cache.get(channelID)) return msg.reply('Please give a proper channel.')

        // send voting message embed to channel and react with respective emojis
        const channel = msg.guild.channels.cache.get(channelID)
        var embedTitle = '**MVP Voting has started! Please vote the participant you think performed the best by reacting with the corresponding emoji.**'
        var messageEmbed = new Discord.MessageEmbed()
            .setTitle(embedTitle)
            .setColor("RANDOM")
            .setFooter('You have 5 minutes until voting ends.');

        currentParticipants.forEach(person => {
            messageEmbed.addField(`Emoji: ${person.emoji}`, `Person: ${person.name}`)
        })

        var mvpMesssage = await channel.send(messageEmbed)
        console.log(mvpMesssage.content)
        ///react with corresponding emojis
        try {
            currentParticipants.forEach(async person => {
                await mvpMesssage.react(discord_emoji_converter.getEmoji(person.emoji))
                    .catch(err => {
                        console.log(`Error occurred in reacting with ${person.emoji} to MVP Message: ` + err)
                    })
            })
            var scores = Array(currentParticipants.length)
            setTimeout(() => {
                //look at reactions and find out whos winner
                var loopCount = 0
                currentParticipants.forEach(person => {
                    scores[loopCount] = mvpMesssage.reactions.cache.find(r => r.emoji.name == discord_emoji_converter.getEmoji(person.emoji)).count
                    loopCount += 1
                })
                
                ///finding out winner
                var highestCount = 0
                var highestCountIndex = 0
                var count = 0
                scores.forEach(score => {
                    if (score > highestCount) {
                        highestCount = score
                        highestCountIndex = count
                    }
                    count += 1
                })

                ///get member
                var winner = msg.guild.member(currentParticipants[highestCountIndex].id)
                if (!winner) return channel.send('Something went wrong in getting the winner.')
                channel.send(`:tada: :tada: :tada: ***CONGRATS <@${winner.id}>!! You are the MVP of this Game Nite with a score of ${highestCount} votes!!!***`)

                //done
            }, 10000)
        } catch (err) {
            console.log(err)
        }
    }
}