// todo: winning condition

const { completionOf, complete } = require('../../general/resources/completion')
const refreshMainMessages = require('./refreshMainMessages')
const flip = require('./flip')

const picks = { coup: true, steal: true, assassinate: true }
const charges = { coup: 7, assassinate: 3 }
const challenges = {
  tax: true,
  steal: true,
  assassinate: true,
  exchange: true,
  block: true,
}
const blocks = {
  faid: ['duke'],
  steal: ['ambassador', 'captain'],
  assassinate: ['contessa'],
}
const dispatches = {
  income: game => {
    game.addToWallet(game.currentPlayer, 1)
    complete('dispatching')
  },
  faid: game => {
    game.addToWallet(game.currentPlayer, 2)
  },
  coup: game => {
    flip(game)
  },
  tax: game => {
    game.addToWallet(game.currentPlayer, 3)
  },
  steal: game => {
    const action = game.getCurrentAction()
    game.addToWallet(action.target, -2)
    game.addToWallet(action.player, 2)
  },
  assassinate: game => {
    flip(game)
  },
  exchange: game => {
    throw Error('exchange not yet implemented')
  },
  block: (game, blockAs) => {
    throw Error('block not yet implemented')
  },
}

module.exports = async (game, move, blockAs = null) => {
  console.log('starting move', move)

  game.actionStack.push({
    type: move,
    player: game.currentPlayer,
    toDispatch: true,
  })

  // picking
  if (picks[move]) {
    game.setCurrentAction({ status: 'picking' })
    game.refreshMainMessages()
    await completionOf('picking')
  }

  // charging
  if (charges[move]) {
    game.addToWallet(game.currentPlayer, -1 * charges[move])
    game.refreshMainMessages()
  }

  // challenging
  if (challenges[move]) {
    game.setCurrentAction({ status: 'challenging' })
    game.refreshMainMessages()
    await completionOf('challenging')
  }

  // blocking
  if (blocks[move]) {
    game.setCurrentAction({ status: 'blocking' })
    game.refreshMainMessages()
    await completionOf('blocking')
  }

  // dispatching
  if (game.getCurrentAction().toDispatch) {
    dispatches[move](game, blockAs)
    await game.refreshMainMessages()
    await completionOf('dispatching')
  }
  console.log('finished dispatching')

  // check for winner
  if (game.alive.length === 1) {
    console.log('winner winner chicken dinner')
    game.winner = game.alive[0].username
    game.endGame()
    return
  }

  // finishing
  game.actionStack.pop()
  if (move === 'block') {
    complete('blocking')
  } else {
    // next player
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.alive.length
    game.currentPlayer = game.alive[game.currentPlayerIndex]
    game.refreshMainMessages()
  }
}
