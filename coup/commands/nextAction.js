module.exports = game => {
  if (game.alive.length === 1) {
    game.winner = game.alive[0].username
    game.emit('endGame')
    return
  }

  // todo: pop currentAction and if it's empty, nextPlayer()

  game.emit('refreshMainMessages')
}
