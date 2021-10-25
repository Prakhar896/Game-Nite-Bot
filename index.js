//Import statements
const Discord = require('discord.js');
const axios = require('axios');
const Database = require("@replit/database")
const kick = require('./commands/kick');
const startnite = require('./commands/startnite');
const stopnite = require('./commands/stopnite');
require('dotenv').config();
const bot = new Discord.Client()
const emojiRandom = require('emoji-random');
const startmvp = require('./commands/startmvp');

//Replit database
const db = new Database()
async function updateDatabase(key, value, db) {
  var newValue = ''
  try {
    await db.set(key, value)
      .then(async () => {
        console.log("Database updated.")
        await db.get(key)
          .then(value => {
            newValue = value
          })
      })
  } catch (err) {
    console.log('Error in updating database: ' + err)
  }
  return newValue
}

async function deleteAllKeys(db) {
  var successful = false
  try {
    await db.list()
      .then(async keys => {
        console.log(keys)
        for (key of keys) {
          await db.delete(key)
            .then(() => { console.log('Deleted: ' + key) })
        }
      })
    successful = true
  } catch (err) {
    console.log('Error in deleting all keys: ' + err)
    successful = false
  }
  return successful
}

function showAllKeysAndValues() {
  db.list()
    .then(keys => {
      console.log(keys)
      var values = []
      for (key of keys) {
        db.get(key)
        .then(value => {
          console.log(value)
          values.push(value)
        })
      }
      console.log(values)
    })
}

//Bot Stuff
const token = process.env.DISCORD_TOKEN
const Prefix = process.env.PREFIX

//Variables
var currentParticipants = []
var currentReactiveMessageID = ''
console.log('ID: ' + currentReactiveMessageID)
console.log(currentParticipants)
///Update variables according to database
async function checkDatabase() {
  try {
    db.list()
      .then(async keys => {
        for (key of keys) {
          if (key == 'currentParticipants') {
            await db.get(key)
              .then(value => {
                currentParticipants = value
              })
          } else if (key == 'currentReactiveMessageID') {
            await db.get(key)
              .then(value => {
                currentReactiveMessageID = value
              })
          }
        }
      })
  } catch (err) {
    console.log('Error in initialising variables with data from database: ' + err)
  }
}

checkDatabase()
  .then(() => {
    ///Update database with variables
    updateDatabase('currentParticipants', currentParticipants, db)
    updateDatabase('currentReactiveMessageID', currentReactiveMessageID, db)
  })

//Custom functions
function participantRemove(idOfUser) {
  var newArray = currentParticipants.filter(function(ele) {
    return ele.id != idOfUser;
  })
  currentParticipants = newArray
}

//Event handlers

bot.on('ready', () => {
  console.log('Game Nite Bot is online!')
})

bot.on('messageReactionAdd', (reaction, user) => {
  //Checks
  if (!currentReactiveMessageID) {
    currentParticipants = []
    updateDatabase('currentParticipants', currentParticipants, db)
    return
  }
  if (reaction.message.id != currentReactiveMessageID) return
  if (reaction.emoji.name != '👍🏻') return

  //Adding to participants and giving role
  var randomEmoji = emojiRandom.random()
  currentParticipants.push({ name: `${reaction.message.guild.member(user).nickname}`, id: `${user.id}`, emoji: randomEmoji })
  updateDatabase('currentParticipants', currentParticipants, db)
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
  if (!currentReactiveMessageID) {
    currentParticipants = []
    updateDatabase('currentParticipants', currentParticipants, db)
    return
  }
  if (reaction.message.id != currentReactiveMessageID) return
  if (reaction.emoji.name != '👍🏻') return

  //Removing from participants and taking role
  participantRemove(user.id)
  updateDatabase('currentParticipants', currentParticipants, db)
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

bot.on('message', async msg => {
  if (!msg.content.startsWith(Prefix)) return
  let args = msg.content.substring(Prefix.length).split(' ')
  if (msg.guild.id != '807599800379768862' && msg.guild.id != '805723501544603658') return msg.channel.send('Sorry, I only function in specific guiilds.')

  //Check downtime
  try {
    await axios({
      method: 'get',
      url: process.env.DT_SERVER_STATUS_URL
    })
      .then(async (response) => {
        if (response.statusText == 'OK' && (response.data == 'True' || response.data == 'False')) {
          if (response.data == 'True') {
            msg.reply('**You caught us at an unfortunate time.** This service is currently experiencing downtime. We will be back up shortly.')
            return
          }
        } else {
          console.log('Error in properly getting downtime status from the server.')
          msg.reply('There was an error in properly getting downtime status. This service cannot continue to operate until a proper status is received. Please try again.')
          return
        }
      })
  } catch (err) {
    console.log('Error in checking downtime: ' + err)
    msg.reply('Sorry, I was unable to check downtime status for this service. Please try again.')
    return
  }

  var activeNite = false
  if (!currentReactiveMessageID) {
    activeNite = false
  } else {
    activeNite = true
  }
  msg.channel.messages.cache.find(m => m.id === currentReactiveMessageID)
  switch (args[0]) {
    case 'startnite':
      startnite.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, db, updateDatabase, deleteAllKeys)
        .then(id => {
          if (typeof id != "string") return
          currentReactiveMessageID = id
        })
        .catch(err => {
          console.log('Error in retrieving reactive message ID: ' + err)
        })
      break;
    case 'stopnite':
      stopnite.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, db, updateDatabase, deleteAllKeys)
        .then(status => {
          if (status) {
            currentReactiveMessageID = undefined
            currentParticipants = []
            updateDatabase('currentReactiveMessageID', currentReactiveMessageID, db)
            updateDatabase('currentParticipants', currentParticipants, db)
          }
        })
        .catch(err => {
          console.log('Error in retrieving Nite status from stopnite command: ' + err)
        })
      break;
    case 'kick':
      kick.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, currentReactiveMessageID)
        .then(newParticipants => {
          if (typeof newParticipants != 'object') return
          currentParticipants = newParticipants
          updateDatabase('currentParticipants', currentParticipants, db)
        })
      break;
    case 'startmvp':
      startmvp.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, currentReactiveMessageID)
      break;
    case 'status':
      var activeMessage = 'Not Active'
      if (activeNite) {
        activeMessage = 'Active'
      }
      msg.reply(`Bot Status: Online, Nite Event: ${activeMessage}, Bot Uptime: ${bot.uptime / 1000} seconds.`)
        .catch(err => {
          console.log("Error in sending status message: " + err)
        })
      break;
  }
})

bot.login(token)