const { complete } = require('../../general/resources/completion')

module.exports = (game, chosenIndicies) => {
  const action = game.getCurrentAction()
  const player = game.currentPlayer
  console.log(chosenIndicies.map(index => action.exchangeOptions[index]))
  console.log(
    chosenIndicies.map(index => ({
      influence: action.exchangeOptions[index],
      isFlipped: false,
    }))
  )

  let newHand = [
    ...game.hands.get(player).filter(card => card.isFlipped),
    ...chosenIndicies.map(index => ({
      influence: action.exchangeOptions[index],
      isFlipped: false,
    })),
  ]

  game.hands.set(player, newHand)
  complete('exchanging')
}
