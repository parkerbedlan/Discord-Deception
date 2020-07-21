const { runningGames } = require('../bot')
module.exports = (client, messageReaction, user) => {
  // console.log(messageReaction.emoji.identifier)
  if (messageReaction.message.guildID !== undefined) return
  if (user.bot) return
  for (const runningGame of Object.values(runningGames).filter(game =>
    game.players.has(user)
  )) {
    if (
      runningGame.type === 'mafia' &&
      messageReaction.emoji.name === '✋' &&
      runningGame.firstNight
    ) {
      runningGame.readyCount += 1
      if (runningGame.readyCount === runningGame.players.size)
        runningGame.emit('startNight')
      return
    } else if (runningGame.type === 'coup') {
      runningGame.emit('income', user)
      return
    }
  }
}
