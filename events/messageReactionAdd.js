const { runningGames } = require('../bot')
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
          return game.emit('income', user)
        case '%F0%9F%92%B8':
          return console.log('foreign aid')
        case '%F0%9F%94%AB':
          return console.log('coup')
        case '%F0%9F%92%B0':
          console.log('tax')
          return game.emit('tax', user)
        case '%F0%9F%8F%B4%E2%80%8D%E2%98%A0%EF%B8%8F':
          return console.log('steal')
        case '%F0%9F%97%A1%EF%B8%8F':
          return console.log('assassinate')
        case '%F0%9F%94%81':
          return console.log('exchange')
        case '%E2%9C%85':
          console.log('allow')
          return game.emit('allow', user)
        case '%E2%9D%8C':
          console.log('challenge')
          return game.emit('challenge', user)
      }
    }
  }
}
