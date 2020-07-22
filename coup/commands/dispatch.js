const actions = {
  tax: game => {
    const player = game.currentPlayer
    game.wallets.set(player, game.wallets.get(player) + 3)
  },
}

module.exports = game => {
  const action = game.getCurrentAction()
  console.log('dispatching', action.type)
  actions[action.type](game)
  game.emit('nextAction')
}
