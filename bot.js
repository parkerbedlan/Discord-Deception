// todo: install eslint
// apparently this is a thing https://discordapi.com/permissions.html

// todo: create a Player object with traits like dead and identity and user
// note: each command is labeled at the top as generalized, [game.type]-specific, or debugging
// todo: refactor game-specific commands into a commands/[game.type] folder
// todo: host on vercel https://youtu.be/1Bfb8pSvoQo https://u.nu/3zs6q https://u.nu/ooxyy
// todo: use https://github.com/entwicklerstube/babel-plugin-root-import for absolute import paths
// idea: give discord-deception ?botwipe for nongame channels

// exports
let runningGames = new Object() // {guild: Game} pairs
let botchats = new Map()

module.exports = {
  runningGames,

  botchats,

  minPlayers: { mafia: 1 },

  maxPlayers: { mafia: 20 },

  generateLobbyMessage(game) {
    const identityEmojis = {
      mafia(playerCount) {
        let identityHat = []
        for (let j = 0; j < Math.ceil(game.players.size * 0.226); j++)
          identityHat.push('m')
        if (game.players.size > 6)
          for (let i = 0; i < Math.ceil(game.players.size * 0.051); i++)
            identityHat.push('c')
        while (identityHat.length < game.players.size) identityHat.push('i')

        const identityToEmoji = {
          m: ':smiling_imp:',
          c: ':cop:',
          i: ':angel:',
        }

        const output = identityHat
          .map(identity => identityToEmoji[identity])
          .join(' ')
        return output ? output : 'What is a game if there is nobody to play it?'
      },

      secretHitler(playerCount) {
        return [
          'What is a game if there is nobody to play it?',
          'We need more players to start the game.',
          'We need more players to start the game.',
          'We need more players to start the game.',
          'We need more players to start the game.',
          ':japanese_ogre: :guard: :angel: :angel: :angel:',
          ':japanese_ogre: :guard: :angel: :angel: :angel: :angel:',
          ':japanese_ogre: :guard: :guard: :angel: :angel: :angel: :angel:',
          ':japanese_ogre: :guard: :guard: :angel: :angel: :angel: :angel: :angel:',
          ':japanese_ogre: :guard: :guard: :guard: :angel: :angel: :angel: :angel: :angel:',
          ':japanese_ogre: :guard: :guard: :guard: :angel: :angel: :angel: :angel: :angel: :angel:',
        ][playerCount]
      },
    }
    return new Discord.MessageEmbed()
      .setColor('#8c9eff')
      .setTitle(`Raise your hand if you wanna play a game of ${game.type}!`)
      .setThumbnail('https://i.imgur.com/IchybTu.png')
      .addFields({
        name: `**Amount of players: ${game.players.size}**`,
        value: identityEmojis.mafia(game.players.size),
      })
  },

  getGeneralTextChannel(guild) {
    let general = guild.channels.cache.find(
      ch => ch.type == 'text' && ch.name == 'general'
    )
    if (!general)
      general = guild.channels.cache.find(
        ch => ch.type == 'text' && ch.rawPosition == 0
      )
    if (!general) return null
    return general
  },

  getGeneralVoiceChannel(guild) {
    let general = guild.channels.cache.find(
      ch => ch.type == 'voice' && ch.name == 'General'
    )
    if (!general)
      general = guild.channels.cache.find(
        ch => ch.type == 'voice' && ch.rawPosition == 0
      )
    if (!general) return null
    return general
  },

  shuffleArray(arr) {
    let newarr = arr.slice()
    let m = newarr.length
    let t, i
    // while there remain elements to shuffle
    while (m) {
      // pick a remaining element
      i = Math.floor(Math.random() * m--)
      // swap it with the current element
      t = newarr[m]
      newarr[m] = newarr[i]
      newarr[i] = t
    }
    return newarr
  },

  unreact: async (message, emojiStr) => {
    for (const [k, v] of message.reactions.cache) {
      if (k === emojiStr && v.me) {
        await v.users.remove(client.user)
        break
      }
    }
  },
}

// dependencies
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')

// create event handlers
fs.readdir('./events/', (err, files) => {
  files.forEach(file => {
    const eventHandler = require(`./events/${file}`)
    const eventName = file.split('.')[0]
    client.on(eventName, (...args) => eventHandler(client, ...args))
  })
})

client.login(process.env.BOT_TOKEN)
