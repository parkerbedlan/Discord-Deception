module.exports = async (game, player) => {
  console.log(player.username, 'is collecting income...')

  game.wallets.set(player, game.wallets.get(player) + 1)
  game.history.push(`${player.username} collected income`)

  game.emit('refreshMainMessages')
  game.emit('nextAction')
}
