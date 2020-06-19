const {MessageEmbed} = require('discord.js')
const commandList = new MessageEmbed()
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

module.exports = msg => {
    msg.channel.send(commandList)
}