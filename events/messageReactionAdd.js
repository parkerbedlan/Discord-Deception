const { runningGames } = require('../bot')
const { startMove } = require('../coup/commands/startMove')
module.exports = (client, messageReaction, user) => {
  // console.log(messageReaction.emoji.identifier)
  if (messageReaction.message.guildID !== undefined) return
  if (user.bot) return
  for (const game of Object.values(runningGames).filter(g =>
    g.players.has(user)
  )) {
    if (
      game.type === 'mafia' &&
      messageReaction.emoji.name === '✋' &&
      game.firstNight
    ) {
      game.readyCount += 1
      if (game.readyCount === game.players.size) game.emit('startNight')
      return
    } else if (game.type === 'coup') {
      switch (messageReaction.emoji.identifier) {
        case '%F0%9F%92%B5':
          console.log('income')
          game.startMove('income')
          break
        case '%F0%9F%92%B8':
          console.log('faid')
          game.startMove('faid')
          break
        case '%F0%9F%94%AB':
          console.log('coup')
          game.startMove('coup')
          break
        case '%F0%9F%92%B0':
          console.log('tax')
          game.startMove('tax')
          break
        case '%F0%9F%8F%B4%E2%80%8D%E2%98%A0%EF%B8%8F':
          console.log('steal')
          game.startMove('steal')
          break
        case '%F0%9F%97%A1%EF%B8%8F':
          console.log('assassinate')
          game.startMove('assassinate')
          break
        case '%F0%9F%94%81':
          console.log('exchange')
          game.startMove('exchange')
          break
        case '%E2%9C%85':
          console.log('allow')
          break
        case '%E2%9D%8C':
          console.log('challenge')
          break
      }
    }
  }
}
