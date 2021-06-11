//Import statements
const Discord = require('discord.js');
const kick = require('./commands/kick');
const startnite = require('./commands/startnite');
const stopnite = require('./commands/stopnite');
require('dotenv').config();
const bot = new Discord.Client()

//Bot Stuff
const token = process.env.DISCORD_TOKEN
const Prefix = process.env.PREFIX

//Variables
var currentParticipants = []
var currentReactiveMessageID = undefined

//Custom functions
function participantRemove(idOfUser) {
    var newArray = currentParticipants.filter(function (ele) {
        return ele.id != idOfUser;
    })
    currentParticipants = newArray
}

bot.on('ready', () => {
    console.log('Game Nite Bot is online!')
})

bot.on('messageReactionAdd', (reaction, user) => {
    //Checks
    if (!currentReactiveMessageID) return currentParticipants = []
    if (reaction.message.id != currentReactiveMessageID) return
    if (reaction.emoji.name != '👍🏻') return

    //Adding to participants and giving role
    currentParticipants.push({ name: `${reaction.message.guild.member(user).nickname}`, id: `${user.id}` })
    console.log(currentParticipants)
    let userAsMember = reaction.message.guild.member(user)
    try {
        const niteRole = reaction.message.guild.roles.cache.find(r => r.id == '852508346216218644' || r.id === '852394228381909005')
        if (!niteRole) return reaction.message.reply('Sorry, I was not able to locate the Nite Role and assign it to people who reacted to the message.')
        userAsMember.roles.add(niteRole)
            .catch(err => {
                console.log('Error occurred in adding role: ' + err)
            })
    } catch (err) {
        reaction.message.reply('Sorry, I was not able to locate the Nite Role and assign it to people who reacted to the message.')
        console.log('Error occurred in adding roles to reactions: ' + err)
    }

    //Edit and Update Reactive Message
    var reactiveMessage = reaction.message
    var newContent = '**New Game Nite! Please react with :thumbsup: below to participate on this new Game Nite!**'
    var count = 1
    currentParticipants.forEach(person => {
        newContent += `\n ${count}. ${person.name}`
        count += 1
    })
    reactiveMessage.edit(newContent)
        .catch(err => {
            console.log('Error occurred in editing (add) message: ' + err)
        })
})

bot.on('messageReactionRemove', (reaction, user) => {
    //Checks
    if (!currentReactiveMessageID) return currentParticipants = []
    if (reaction.message.id != currentReactiveMessageID) return
    if (reaction.emoji.name != '👍🏻') return

    //Removing from participants and taking role
    participantRemove(user.id)
    console.log(currentParticipants)
    let userAsMember = reaction.message.guild.member(user)
    try {
        const niteRole = reaction.message.guild.roles.cache.find(r => r.id == '852508346216218644' || r.id === '852394228381909005')
        if (!niteRole) return reaction.message.reply('Sorry, I was not able to locate the Nite Role and remove it from people who un-reacted to the message.')
        userAsMember.roles.remove(niteRole)
            .catch(err => {
                console.log('Error occurred in adding role: ' + err)
            })
    } catch (err) {
        reaction.message.reply('Sorry, I was not able to locate the Nite Role and remove it from people who un-reacted to the message.')
        console.log('Error occurred in adding roles to reactions: ' + err)
    }

    //Edit and Update Message
    var reactiveMessage = reaction.message
    var newContent = '**New Game Nite! Please react with :thumbsup: below to participate on this new Game Nite!**'
    var count = 1
    currentParticipants.forEach(person => {
        newContent += `\n ${count}. ${person.name}`
        count += 1
    })
    reactiveMessage.edit(newContent)
        .catch(err => {
            console.log('Error occurred in editing (remove) message: ' + err)
        })
})

bot.on('message', msg => {
    if (!msg.content.startsWith(Prefix)) return
    let args = msg.content.substring(Prefix.length).split(' ')
    if (msg.guild.id != '807599800379768862' && msg.guild.id != '805723501544603658') return msg.channel.send('Sorry, I only function in specific guiilds.')
    var activeNite = false
    if (!currentReactiveMessageID) {
        activeNite = false
    } else {
        activeNite = true
    }
    switch (args[0]) {
        case 'startnite':
            startnite.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite)
                .then(id => {
                    currentReactiveMessageID = id
                })
                .catch(err => {
                    console.log('Error in retrieving reactive message ID: ' + err)
                })
            break;
        case 'stopnite':
            stopnite.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite)
                .then(status => {
                    if (status) {
                        currentReactiveMessageID = undefined
                        currentParticipants = []
                    }
                })
                .catch(err => {
                    console.log('Error in retrieving Nite status from stopnite command: ' + err)
                })
            break;
        case 'kick':
            kick.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite)
    }
})

bot.login(token)