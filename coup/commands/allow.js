const { complete } = require('../../general/resources/completion')
module.exports = (game, player) => {
  if (player !== game.currentPlayer) game.allowers.add(player)
  if (game.allowers.size === game.alive.length - 1) {
    complete(game.getCurrentAction().status)
  }
}
