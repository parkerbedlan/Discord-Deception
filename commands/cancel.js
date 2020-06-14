// generalized
const {runningGames} = require('../bot.js');

module.exports = msg => {
    const game = runningGames[msg.guild]

    if (!game)
    {
        return msg.reply("There's no started game to cancel! Use ?help to see what games you can choose from.")
    }
    else if (game.status == 'playing')
    {
        return msg.reply("I'm sorry Dave, I'm afraid I can't do that. This game is too important for me to allow you to jeopardize it.")
    }
    else if (msg.author != game.host)
    {
        return msg.channel.send("Only the host (<@!" + game.host + ">) can ?cancel the game, you trickster you.")
    }

    game.lobbyMsg.delete()
    delete runningGames[msg.guild]
    msg.reply('Your game has been #cancelled')
}