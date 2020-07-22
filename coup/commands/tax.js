module.exports = (game, player) => {
  game.actionStack.push({ type: 'tax', player, confirming: true })

  game.emit('refreshMainMessages')
}
