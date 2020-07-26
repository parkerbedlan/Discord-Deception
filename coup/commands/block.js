const { complete } = require('../../general/resources/completion')

module.exports = (game, player, blockAs) => {
  if (game.getCurrentAction().status === 'challenging') {
    game.setCurrentAction({ status: 'blocking' })
    complete('challenging')
  }
  game.currentPlayer = player
  game.startMove(player, 'block', blockAs)
}
