// todo: refactor event handlers into events folder
// todo: create a Player object with traits like dead and job and user
// note: each command is labeled at the top as generalized, [game.type]-specific, or debugging
    // todo: refactor game-specific commands into a commands/[game.type] folder
// todo: host on vercel https://youtu.be/1Bfb8pSvoQo https://u.nu/3zs6q https://u.nu/ooxyy
// idea: give discord-deception ?botwipe for nongame channels

// exports
let runningGames = new Object()  // {guild: Game} pairs
let botchats = new Map()
function Game(type, host, guild, status='lobby')
{
    if (!(new Set(['mafia']).has(type)))
    {
        throw("Oi bruv that game doesn't even exist yet.")
    }
    if (!(new Set(['lobby','playing']).has(status)))
    {
        throw("Aye homes that status ain't a thing.")
    }
    this.type = type
    this.host = host
    this.guild = guild
    this.status = status
    this.players = new Set()
    this.lobbyMsg = null
    this.playersRole = null
    this.muted = false
    this.firstNight = true

    this.handlers = {}
    this.on = (eventName, handler) =>
    {
        if (!this.handlers[eventName])
          this.handlers[eventName] = [];
    
        this.handlers[eventName].push(handler);
    }
    this.emit = (eventName, data) =>
    {
        for (const handler of this.handlers[eventName])
            handler(data)
    }
}
module.exports = {
    botchats,

    minPlayers: {mafia: 2},

    maxPlayers: {mafia: 20},

    runningGames,

    Game,

    createBotchat(userSet)
    {
        let bcusers = new Map()
        userSet.forEach(user => bcusers.set(user.id, user))
        let bcusersStr = ''
        bcusers.forEach(user => {
            bcusersStr += user.username + '\n'
            botchats.set(user, bcusers)
        })
        return [bcusers, bcusersStr]
    },

    signUpMessage(game)
    {
        jobEmojis = {
            mafia(playerCount)
            {
                let jobHat = []
                for (j = 0; j < Math.ceil(game.players.size * .226); j++)
                    jobHat.push('m')
                if (game.players.size > 6)
                    for (i = 0; i < Math.ceil(game.players.size * .051); i++)
                        jobHat.push('c')
                while (jobHat.length < game.players.size)
                    jobHat.push('i')
                
                const jobToEmoji = {
                    'm':':smiling_imp:',
                    'c': ':cop:',
                    'i': ':angel:'
                }

                const output = jobHat.map(job => jobToEmoji[job]).join(' ')
                return output ? output : 'What is a game if there is nobody to play it?'
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
    },

    unreact: async (message, emojiStr) => {
        for ([k,v] of message.reactions.cache)
        {
            if (k === emojiStr && v.me)
            {
                await v.users.remove(client.user)
                break
            }
        }
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
const end = require("./commands/endGame")
const clearPast = require("./commands/clearPast")
const kill = require('./commands/kill')
const inspect = require('./commands/inspect')
const cleanup = require("./commands/cleanup")
const accuse = require("./commands/accuse")
const vote = require("./commands/vote")

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

// client.on('guildMemberSpeaking', (member, speaking))

// when someone sends a message that the bot can see
client.on('message', msg => {
    if(msg.author.bot) return

    // console.log(msg.content)
    if(!msg.guild && botchats.has(msg.author))
    {
        if(msg.cleanContent.toLowerCase().startsWith('?kill'))
        {
            if (kill(msg) != 'only mafia can use ?kill')
                return
        }
        else if (msg.cleanContent.toLowerCase().startsWith('?inspect'))
        {
            if (inspect(msg) != 'only cops can use ?inspect')
                return
        }
        const toSend = `**${msg.author.username}:**  ${msg.content}`
        const bcusers = botchats.get(msg.author)
        bcusers.forEach(user => {
            if (user != msg.author)
                user.send(toSend)
        })
        return
    }
    else if (!msg.guild)
    {
        if (msg.cleanContent.toLowerCase().startsWith('?accuse'))
        {
            accuse(msg)
            return
        }
        else if (msg.cleanContent.toLowerCase().startsWith('?vote'))
        {
            vote(msg)
            return
        }
    }

    if(runningGames[msg.guild] && runningGames[msg.guild].muted && msg.channel == runningGames[msg.guild].generalTextChannel)
    {
        msg.delete()
    }

    if (!msg.content.startsWith('?') || msg.content.replace(/[?]/g,'').trim() == '' || msg.content.replace(/[?]/g,'').substring(0,1) == " ") return

    // todo: check that you have admin permissions first and return error if you don't

    if (msg.content.toLowerCase() == '?ping')
    {
        msg.reply('Pong!')
    }
    else if(msg.content.toLowerCase() == '?help')
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
    else if (msg.content.toLowerCase() == '?cleanup')
    {
        if(runningGames[msg.guild] && runningGames[msg.guild].status == 'ended')
            cleanup(runningGames[msg.guild])
    }
    else if(msg.content.toLowerCase() == '??end')   //only for debugging
    {
        if(runningGames[msg.guild] && runningGames[msg.guild].status == 'playing')
            end(runningGames[msg.guild])
        else
            msg.reply("That debugging command can only be used during a running game.")
    }
    else if(msg.content.toLowerCase() == '??clear') //only for debugging
    {
        clearPast(msg)
    }
    else if(/^[?](kill|inspect|accuse|vote)/i.test(msg.cleanContent))
    {
        msg.delete()
        msg.reply("That command only works when you DM it to me.")
    }
    else if(msg.content.replace(/[?]/g,'').substring(0,1) != " ")
    {
        msg.reply("That's not a command. To see the full list of commands, type \"?help\".")
    }
})

client.login(process.env.BOT_TOKEN)