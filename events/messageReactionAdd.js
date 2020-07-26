const { runningGames } = require('../bot')
const { complete } = require('../general/resources/completion')
const message = require('./message')

const letterEmojiIdentifierToString = identifier =>
  `:regional_indicator_${String.fromCharCode(
    parseInt(identifier.substring(10), 16) - 69
  )}:`

module.exports = (client, messageReaction, user) => {
  // console.log(messageReaction.emoji.identifier)
  // console.log(messageReaction.message.reactions.cache.get(messageReaction.emoji.name).count)
  if (
    messageReaction.message.reactions.cache.get(messageReaction.emoji.name)
      .count < 2
  )
    return
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
    } else if (game.type === 'coup' && game.alive.includes(user)) {
      switch (messageReaction.emoji.identifier) {
        case '%F0%9F%92%B5':
          console.log('income')
          game.startMove(user, 'income')
          break
        case '%F0%9F%92%B8':
          console.log('faid')
          game.startMove(user, 'faid')
          break
        case '%F0%9F%94%AB':
          console.log('coup')
          game.startMove(user, 'coup')
          break
        case '%F0%9F%92%B0':
          console.log('tax')
          game.startMove(user, 'tax')
          break
        case '%F0%9F%8F%B4%E2%80%8D%E2%98%A0%EF%B8%8F':
          console.log('steal')
          game.startMove(user, 'steal')
          break
        case '%F0%9F%97%A1':
          console.log('assassinate')
          game.startMove(user, 'assassinate')
          break
        case '%F0%9F%94%81':
          console.log('exchange')
          game.startMove(user, 'exchange')
          break
        case '%E2%9C%85':
          console.log('allow')
          game.allow(user)
          break
        case '%E2%9D%8C':
          console.log('challenge')
          game.challenge(user)
          break
        case '1%EF%B8%8F%E2%83%A3':
          console.log('one')
          if (
            game.getCurrentAction() &&
            game.getCurrentAction().status === 'flipping' &&
            user === game.getCurrentAction().flipper
          ) {
            game.flip(game.getCurrentAction().flipper, 0)
          }
          break
        case '2%EF%B8%8F%E2%83%A3':
          console.log('two')
          if (
            game.getCurrentAction().status === 'flipping' &&
            user === game.getCurrentAction().flipper
          ) {
            game.flip(game.getCurrentAction().flipper, 1)
          }
          break
        case '%F0%9F%99%85':
          console.log('duke block')
          game.block(user, 'duke')
          break
        case '%F0%9F%95%8A%EF%B8%8F':
          console.log('ambassador block')
          game.block(user, 'ambassador')
          break
        case '%E2%9A%94%EF%B8%8F':
          console.log('captain block')
          game.block(user, 'captain')
          break
        case '%F0%9F%9B%A1%EF%B8%8F':
          console.log('contessa block')
          game.block(user, 'contessa')
          break
        default:
          if (
            messageReaction.emoji.identifier.startsWith('%F0%9F%87%') &&
            game.getCurrentAction().status === 'picking'
          ) {
            game.setCurrentAction({
              target: game
                .getCurrentAction()
                .picks.get(
                  letterEmojiIdentifierToString(
                    messageReaction.emoji.identifier
                  )
                ),
            })
            game.setCurrentAction({ picks: undefined })
            complete('picking')
          } else {
            console.log(messageReaction.emoji.identifier)
          }
      }
    }
  }
}
