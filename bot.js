//stuff to export
let runningGames = new Object()  // {guild: Game} pairs
function Game(type, host, guild, status='setup')
{
    if (!(new Set(['mafia']).has(type)))
    {
        throw("Oi bruv that game doesn't even exist yet.")
    }
    if (!(new Set(['setup','playing']).has(status)))
    {
        throw("Aye homes that status ain't a thing.")
    }
    this.type = type
    this.host = host
    this.guild = guild
    this.status = status
    this.players = new Set()
}
module.exports = {
    minPlayers: {mafia: 1},

    maxPlayers: {mafia: 2},

    runningGames,

    Game,

    signUpMessage(game)
    {
        jobEmojis = {
            mafia(playerCount)
            {
                // secret hitler jobs as a placeholder
                // example: :smiling_imp: :smiling_imp: :angel: :angel: :angel: :angel: :cop: :man_health_worker:
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
                    ':japanese_ogre: :guard: :guard: :guard: :angel: :angel: :angel: :angel: :angel: :angel:'
                ][playerCount]
            },
    
            secretHitler(playerCount)
            {
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
                    ':japanese_ogre: :guard: :guard: :guard: :angel: :angel: :angel: :angel: :angel: :angel:'
                ][playerCount]
            }
        }
        return new Discord.MessageEmbed()
            .setColor('#8c9eff')
            .setTitle(`Raise your hand if you wanna play a game of ${game.type}!`)
            .setThumbnail("https://i.imgur.com/IchybTu.png")
            .addFields({
                name: `**Amount of players: ${game.players.size}**`,
                value: jobEmojis.mafia(game.players.size)
            })
    },    

    getChannel(guild, type, name = "", index = -1)
    {
        return guild.channels.cache.find(ch => (ch.type==type && ch.name==name))
    },

    getGeneralTextChannel(guild)
    {
        let general = module.exports.getChannel(guild, 'text', 'general')
        if (!general)
            general = guild.channels.cache.find(ch => (ch.type=='text' && ch.rawPosition == 0))
        if (!general)
            return null
        return general
    },

    // todo: return shuffled array but don't shuffle original
    shuffleArray(arr)
    {
        let newarr = arr.slice()
        let m = newarr.length
        let t, i
        // while there remain elements to shuffle
        while (m)
        {
            // pick a remaining element
            i = Math.floor(Math.random() * m--)
            // swap it with the current element
            t = newarr[m]
            newarr[m] = newarr[i]
            newarr[i] = t
        }
        return newarr
    }
}

// dependencies
require("dotenv").config()
const Discord = require('discord.js')
const client = new Discord.Client()

// commands to import
const mafiaSetUp = require('./commands/mafiaSetUp')
const readyCommand = require('./commands/readyCommand') // called "readyCommand" to differentiate from the "ready" event
const cancel = require('./commands/cancel')

// what ?help shows
const commandList = new Discord.MessageEmbed()
    .setColor("#8c9eff")
    .setTitle("Discord Deception Bot Commands:")
    .setURL("https://github.com/trevorliu13/Discord-Deception")
    .setThumbnail("https://i.imgur.com/IchybTu.png")
    .addFields({
        name: "**Commands:**",
        value: "```diff\n" + 
            "?help: This thing pops up\n" +
            "?ping: Pong!\n" +
            "?mafia: [Under construction]" +
            "```"
    })

// when the bot goes online or restarts
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setPresence({activity: {name: "Discord Deception | use ?help", type: "PLAYING"}, status:"online"})
})

// when the bot is added to a new server
client.on('guildCreate', guild => {
    module.exports.getGeneralTextChannel(guild).send("Hi, I'm the Discord Deception Bot, thanks for adding me! I'm a bot for hosting fun deception games like Mafia, and an original one called InsertCoolNewName!")
    module.exports.getGeneralTextChannel(guild).send("Use ?help to see what I can do.")
})

// when someone sends a message that the bot can see
client.on('message', async msg => {
    // console.log(msg.content)
    if (!msg.content.startsWith('?')) return

    // todo: check that you have admin permissions first and return error if you don't
    
    if (msg.content == '?ping')
    {
        msg.reply('Pong!')
    }
    else if(msg.content == '?help')
    {
        msg.channel.send(commandList)
    }
    else if(msg.content.toLowerCase().startsWith('?mafia'))
    {
        mafiaSetUp(client, msg)
    }
    else if(msg.content.toLowerCase().startsWith('?ready'))
    {
        readyCommand(msg)
    }
    else if(msg.content.toLowerCase().startsWith('?cancel'))
    {
        cancel(msg)
    }
    else if(msg.content.substring(1,2) != " ")
    {
        msg.reply("That's not a command. To see the full list of commands, type \"?help\".")
    }
})

client.login(process.env.BOT_TOKEN)