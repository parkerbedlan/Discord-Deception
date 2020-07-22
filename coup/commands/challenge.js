const { shuffleArray } = require('../../bot')

const actionToString = action => {
  switch (action.type) {
    case 'tax':
      return 'collecting tax'
  }
}

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
}

module.exports = (game, challenger) => {
  if (
    !game.getCurrentAction() ||
    !game.getCurrentAction().confirming ||
    challenger === game.currentPlayer
  )
    return

  const proof = game.hands
    .get(game.currentPlayer)
    .find(
      card =>
        card.influence === actionToInfluence[game.getCurrentAction().type] &&
        card.isFlipped === false
    )

  if (proof) {
    // todo: challenger picks a card to flip over
    replaceCard(game, game.currentPlayer, proof.influence)
    game.history.push(
      `${challenger.username} failed to challenge ${
        game.currentPlayer.username
      } on ${actionToString(game.getCurrentAction())}, so ${
        challenger.username
      } flips a card and ${game.currentPlayer.username} replaces their ${
        proof.influence
      } card.`
    )
    game.emit('dispatch')
  } else {
    // todo: currentPlayer picks a card to flip over
    game.history.push(
      `${challenger.username} successfully challenged ${
        game.currentPlayer.username
      } on ${actionToString(game.getCurrentAction())}, so ${
        game.currentPlayer.username
      } flips a card.`
    )
  }

  throw Error('not yet implemented')
}
