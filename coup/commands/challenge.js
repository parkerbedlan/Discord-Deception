const { completionOf, complete } = require('../../general/resources/completion')
const { shuffleArray } = require('../../bot')

const proofs = action => {
  switch (action.type) {
    case 'tax':
      return 'duke'
    case 'steal':
      return 'captain'
    case 'assassinate':
      return 'assassin'
    case 'exchange':
      return 'ambassador'
    case 'block':
      return action.blockAs
  }
}

const replaceCard = (game, player, originalInfluence) => {
  game.deck.push(originalInfluence)
  game.deck = shuffleArray(game.deck)
  for (const card of game.hands.get(player)) {
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
        card.influence === proofs(game.getCurrentAction()) &&
        card.isFlipped === false
    )

  if (proof) {
    console.log('there was proof')
    replaceCard(game, game.currentPlayer, proof.influence)
    game.flip(challenger)
    await completionOf('flipping')
    console.log('finished flipping')
    complete('challenging')
  } else {
    console.log("there wasn't proof")
    game.setCurrentAction({ toDispatch: false })
    if (game.getCurrentAction().type === 'assassinate')
      game.addToWallet(game.currentPlayer, 3)
    game.flip(game.currentPlayer)
    await completionOf('flipping')
    console.log('finished flipping')
    complete('challenging')
  }
}
