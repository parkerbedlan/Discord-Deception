module.exports = async (game, player) => {
  game.wallets.set(player, game.wallets.get(player) + 1)
  game.history.push(`${player.username} collected income`)

  game.emit('nextAction')
}
