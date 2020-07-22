module.exports = (game, player) => {
  // if no choice, do it for them then mark them dead
  // else, they get to pick, so make it an action
  game.actionStack.push({ type: 'flip', player })
  game.emit('refreshMainMessages')
}
