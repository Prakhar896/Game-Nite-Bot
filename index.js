//Import statements
const Discord = require('discord.js');
const axios = require('axios');
const discord_emoji_converter = require('discord-emoji-converter');
const Database = require("@replit/database")
const kick = require('./commands/kick');
const startnite = require('./commands/startnite');
const stopnite = require('./commands/stopnite');
require('dotenv').config();
const bot = new Discord.Client()
const emojiRandom = require('emoji-random');
const startmvp = require('./commands/startmvp');

//GN-database
async function updateDatabase(newData) {
  var status = false
  await axios({
    method: 'post',
    url: process.env.GN_DATABASE_DATAUPDATE_URL,
    headers: {
      'AccessKey': process.env.GN_DATABASE_ACCESS_KEY,
      'Content-Type': 'application/json'
    },
    data: {
      "data": newData
    }
  })
    .then(async (response) => {
      if (response.statusText != 'OK' || response.data.startsWith('ERR')) {
        status = false
      } else if (response.data == 'Update successfull.') {
        status = true
      }
    })
    .catch(err => {
      console.log('Error in updating database to new data: ' + err)
      status = false
    })
  return status
}

async function showAllKeysAndValues() {
  var status = false
  await axios({
    method: 'get',
    url: process.env.GN_DATABASE_DATA_DISPLAY_URL
  })
    .then(async response => {
      if (response.statusText == 'OK') {
        status = response.data
      } else {
        console.log('Error in getting current keys and values.')
        status = false
      }
    })
  return status
}

//Bot Stuff
const token = process.env.DISCORD_TOKEN
const Prefix = process.env.PREFIX

//Variables
var currentParticipants = []
var currentReactiveMessageID = ''
///Update variables according to database
async function refreshLocalData() {
  var refreshStatus = false
  await showAllKeysAndValues()
    .then(async status => {
      if (status != false) {
        currentParticipants = status['currentParticipants']
        currentReactiveMessageID = status['currentReactiveMessageID']
        refreshStatus = true
      } else {
        refreshStatus = status
      }
    })
  return refreshStatus
}

refreshLocalData()
  .then((status) => {
    console.log("")
    console.log('Refreshed local data with status: ' + status)
    console.log(currentParticipants)
    console.log("ID: " + currentReactiveMessageID)
  })

//Custom functions
function participantRemove(idOfUser) {
  var newArray = currentParticipants.filter(function (ele) {
    return ele.id != idOfUser;
  })
  currentParticipants = newArray
}

function generateNewDataObject(currentParticipants, currentReactiveMessageID) {
  var data = {"currentParticipants": currentParticipants, "currentReactiveMessageID": currentReactiveMessageID}
  return data
}

//Event handlers

bot.on('ready', () => {
  console.log('Game Nite Bot is online!')
})

bot.on('messageReactionAdd', (reaction, user) => {
  //Checks
  if (!currentReactiveMessageID) {
    currentParticipants = []
    updateDatabase(generateNewDataObject([], ""))
    return
  }
  console.log(reaction.message.id)
  if (reaction.message.id != currentReactiveMessageID) return
  if (reaction.emoji.name != '👍🏻') return

  //Adding to participants and giving role
  var randomEmoji = emojiRandom.random()
  while (true) {
    try {
      var hello = discord_emoji_converter.getEmoji(randomEmoji)
      break;
    } catch (err) {
      console.log(err + ", generating new emoji with error checker.")
      randomEmoji = emojiRandom.random()
      continue
    }
  }
  currentParticipants.push({ name: `${reaction.message.guild.member(user).nickname}`, id: `${user.id}`, emoji: randomEmoji })
  updateDatabase(generateNewDataObject(currentParticipants, currentReactiveMessageID))
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
    updateDatabase(generateNewDataObject([], ""))
    return
  }
  if (reaction.message.id != currentReactiveMessageID) return
  if (reaction.emoji.name != '👍🏻') return

  //Removing from participants and taking role
  participantRemove(user.id)
  updateDatabase(generateNewDataObject(currentParticipants, currentReactiveMessageID))
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
  if (!currentReactiveMessageID || currentReactiveMessageID == "") {
    activeNite = false
  } else {
    activeNite = true
  }
  msg.channel.messages.cache.find(m => m.id === currentReactiveMessageID)
  switch (args[0]) {
    case 'startnite':
      startnite.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, updateDatabase, showAllKeysAndValues, generateNewDataObject)
        .then(id => {
          if (typeof id != "string") return
          currentReactiveMessageID = id
        })
        .catch(err => {
          console.log('Error in retrieving reactive message ID: ' + err)
        })
      break;
    case 'stopnite':
      stopnite.execute(msg, args, Prefix, bot, Discord, currentParticipants, activeNite, updateDatabase, showAllKeysAndValues, generateNewDataObject)
        .then(status => {
          if (status) {
            currentReactiveMessageID = ""
            currentParticipants = []
            updateDatabase(generateNewDataObject([], ""))
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