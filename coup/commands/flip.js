const { complete } = require('../../general/resources/completion')

module.exports = (game, player) => {
  console.log('flipping', player.username)
  complete('flipping')
  // throw Error('flip not yet implemented')
}
