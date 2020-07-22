const flip = require('./flip')
const { completionOf, complete } = require('../../general/resources/completion')

const actionToInfluence = {
  tax: 'duke',
  steal: 'captain',
  assassinate: 'assassin',
  exchange: 'ambassador',
  'block as duke': 'duke',
  'block as captain': 'captain',
  'block as ambassador': 'ambassador',
}

const replaceCard = (game, player, originalInfluence) => {
  game.deck.push(originalInfluence)
  game.deck = shuffleArray(game.deck)
  for (const card in game.hands.get(player)) {
    if (!card.isFlipped && card.influence === originalInfluence) {
      card.influence = game.deck.pop()
      return
    }
  }
  throw Error("couldn't find card to replace")
}

module.exports = async (game, challenger) => {
  console.log(
    challenger.username,
    'is challenging',
    game.currentPlayer.username,
    'on',
    game.getCurrentAction().type
  )

  const proof = game.hands
    .get(game.currentPlayer)
    .find(
      card =>
        card.influence === actionToInfluence[game.getCurrentAction().type] &&
        card.isFlipped === false
    )

  if (proof) {
    replaceCard(game, game.currentPlayer, proof.influence)
    game.flip(challenger)
    await completionOf('flipping')
    complete('challenging')
  } else {
    game.setCurrentAction({ toDispatch: false })
    game.flip(game.currentPlayer)
    await completionOf('flipping')
    complete('challenging')
  }
}
