require("dotenv").config()
const Discord = require('discord.js') 
const client = new Discord.Client()  

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
    else if(msg.content.substring(1,2) != " ")
    {
        msg.reply("That's not a command. To see the full list of commands, type \"?help\".")
    }
})

client.login(process.env.BOT_TOKEN)