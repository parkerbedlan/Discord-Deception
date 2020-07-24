const { complete } = require('../../general/resources/completion')

module.exports = (game, player, cardIndex = -1) => {
  const hasFlippedCard = player =>
    !!game.hands.get(player).find(card => card.isFlipped)

  const killPlayer = player => {
    console.log('killing', player.username)
    game.hands.set(
      player,
      game.hands.get(player).map(card => ({ ...card, isFlipped: true }))
    )
    game.alive = game.alive.filter(p => p !== player)
    console.log(
      'new alive players:',
      game.alive.map(player => player.tag)
    )
  }

  if (cardIndex !== -1) {
    console.log('flipping', cardIndex, 'th card')
    game.hands.set(
      player,
      game.hands.get(player).map((card, index) => ({
        ...card,
        isFlipped: index === cardIndex ? true : card.isFlipped,
      }))
    )
    game.setCurrentAction({ flipper: undefined })
    complete('flipping')
    return
  }
  console.log('flipping', player.username)
  if (hasFlippedCard(player)) {
    killPlayer(player)
    complete('flipping')
  } else {
    game.setCurrentAction({ status: 'flipping', flipper: player })
    game.refreshMainMessages()
  }
}
