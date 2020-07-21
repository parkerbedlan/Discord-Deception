module.exports = game => {
  const nextPlayer = () => {
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.alive.length
    game.currentPlayer = game.alive[game.currentPlayerIndex]
  }

  if (game.alive.length === 1) {
    game.winner = game.alive[0].username
    game.emit('refreshMainMessages').then(game.emit('endGame'))
    return
  }

  // todo: pop currentAction and if it's empty, nextPlayer()
  if (game.currentAction.length) {
    // todo: pop currentAction
  } else {
    nextPlayer()
  }

  console.log('refreshing after nextAction...')
  game.emit('refreshMainMessages')
}
