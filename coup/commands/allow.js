// todo: for victimOnly challenges, only 1 allow needed (from the victim)

const { complete } = require('../../general/resources/completion')
module.exports = (game, player) => {
  if (player !== game.currentPlayer) game.allowers.add(player)
  if (game.allowers.size === game.alive.length - 1) {
    complete(game.getCurrentAction().status)
  }
}
