const { runningGames } = require('../bot')
module.exports = msg => {
  const game = runningGames[msg.guild]
  game.status = 'playing'
  game.players.delete(msg.client.user)
  game.players.add(game.host)
  console.log(
    `Starting ${game.type} game with ${game.players.size} player${
      game.players.size > 1 ? 's' : ''
    }`
  )
  msg.reply(`Starting a game of coup with ${game.players.size} players!`)
}
