require("dotenv").config()
const Discord = require('discord.js')
const client = new Discord.Client()
const mafia = require('./commands/mafia')

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
            "```"
    })

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setPresence({activity: {name: "Discord Deception | use ?help", type: "PLAYING"}, status:"online"})
})

client.on('guildCreate', guild => {
    module.exports.getGeneralTextChannel(guild).send("Hi, I'm the Discord Deception Bot, thanks for adding me! I'm a bot for hosting fun deception games like Mafia, and an original one called InsertCoolNewName!")
    module.exports.getGeneralTextChannel(guild).send("Use ?help to see what I can do.")
})

client.on('message', async msg => {

    if (!msg.content.startsWith('?')) return

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
        mafia(msg)
    }
    else if(msg.content.substring(1,2) != " ")
    {
        msg.reply("That's not a command. To see the full list of commands, type \"?help\".")
    }
})

client.login(process.env.BOT_TOKEN)

module.exports = {

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
    }
}