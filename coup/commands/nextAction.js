module.exports = game => {
  const nextPlayer = () => {
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.alive.length
    game.currentPlayer = game.alive[game.currentPlayerIndex]
  }

  // comment out for single player testing
  // if (game.alive.length === 1) {
  //   game.winner = game.alive[0].username
  //   game.emit('refreshMainMessages').then(game.emit('endGame'))
  //   return
  // }

  if (game.actionStack.length) {
    game.actionStack.pop()
    game.currentPlayer = game.getCurrentAction().player
  } else {
    nextPlayer()
  }

  console.log('refreshing after nextAction...')
  game.emit('refreshMainMessages')
}
