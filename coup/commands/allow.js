const { complete } = require('../../general/resources/completion')
const victimOnlyBlockMoves = new Set(['steal', 'assassinate'])
module.exports = (game, player) => {
  if (player !== game.currentPlayer) game.allowers.add(player)
  else return

  const action = game.getCurrentAction()
  if (
    action.status === 'challenging' &&
    game.allowers.size === game.alive.length - 1
  ) {
    complete('challenging')
    if (victimOnlyBlockMoves.has(action.type)) complete('blocking')
  } else if (
    action.status === 'blocking' &&
    (victimOnlyBlockMoves.has(action.type) ||
      game.allowers.size === game.alive.length - 1)
  ) {
    complete('blocking')
  }
}
