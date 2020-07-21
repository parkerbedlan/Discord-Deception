module.exports = (game, player) => {
  game.currentAction.push({ type: 'tax', player: player, confirming: true })

  game.emit('refreshMainMessages')
}
