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

    // check for winner
    console.log('checking for winner...')
    if (game.alive.length === 1) {
      console.log('winner winner chicken dinner')
      game.winner = game.alive[0].username
      game.endGame()
      return
    }
    console.log('no winner yet,', game.alive.length, 'players left')
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
    if (!game.winner) complete('flipping')
  } else {
    game.setCurrentAction({ status: 'flipping', flipper: player })
    game.refreshMainMessages()
  }
}
