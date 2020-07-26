const { complete } = require('../../general/resources/completion')

module.exports = (game, player, blockAs) => {
  game.setCurrentAction({ status: 'blocking' })
  if (game.getCurrentAction().status === 'challenging') complete('challenging')
  game.startMove(player, 'block', blockAs)
}
