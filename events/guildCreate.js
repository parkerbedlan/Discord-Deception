// when the bot is added to a new server

const {getGeneralTextChannel} = require('../bot')
module.exports = (client, guild) => {
    getGeneralTextChannel(guild).send("Hi, I'm the Discord Deception Bot, thanks for adding me! I'm a bot for hosting fun deception games like Mafia, and an original one called InsertCoolNewName!")
    getGeneralTextChannel(guild).send("Use ?help to see what I can do.")
}