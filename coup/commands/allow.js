const actionToString = action => {
  let output = action.player.username + ' '
  switch (action.type) {
    case 'tax':
      return output + ' collected tax'
  }
}

module.exports = (game, player) => {
  if (player !== game.currentPlayer) game.allowers.add(player)
  if (game.allowers.size === game.alive.length - 1) {
    game.history.push(actionToString(game.getCurrentAction()))
    game.emit('dispatch')
  }
}
