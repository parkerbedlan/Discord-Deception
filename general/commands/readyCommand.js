// generalized
// called "readyCommand" to differentiate from the "ready" event

const root = require.main
const { runningGames, minPlayers } = root.require('./bot.js')
const startMafia = root.require('./mafia/startMafia.js')
const startCoup = root.require('./coup/startCoup.js')

module.exports = msg => {
  const game = runningGames[msg.guild]

  if (!game) {
    return msg.reply(
      "You haven't started a game to be ready for yet! Use ?help to see what games you can choose from."
    )
  } else if (game.status == 'playing') {
    return msg.reply("The game's already started, silly willy!")
  } else if (msg.author != game.host) {
    return msg.channel.send(
      'Only the host (<@!' + game.host + '>) can use ?ready to start the game.'
    )
  } else if (game.players.size < minPlayers[game.type]) {
    return msg.channel.send(
      `You need at least ${minPlayers[game.type]} players to start a game of ${
        game.type
      }.`
    )
  } else {
    game.lobbyMsg.delete()
    game.lobbyMsg = null
    if (game.type == 'mafia') startMafia(msg)
    else if (game.type == 'coup') startCoup(msg)
  }
}
