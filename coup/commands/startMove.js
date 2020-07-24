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
    complete('dispatching')
  },
  coup: async game => {
    game.flip(game.getCurrentAction().target)
    await completionOf('flipping')
    complete('dipatching')
  },
  tax: game => {
    game.addToWallet(game.currentPlayer, 3)
    complete('dispatching')
  },
  steal: game => {
    const action = game.getCurrentAction()
    game.addToWallet(action.target, -2)
    game.addToWallet(action.player, 2)
    complete('dispatching')
  },
  assassinate: async game => {
    game.flip(game.getCurrentAction().target)
    await completionOf('flipping')
    complete('dipatching')
  },
  exchange: game => {
    throw Error('exchange not yet implemented')
  },
  block: (game, blockAs) => {
    game.setCurrentAction({ toDispatch: false })
    throw Error('block not yet implemented')
  },
}

module.exports = async (game, move, blockAs = null) => {
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
    game.allowers = new Set()
    game.setCurrentAction({ status: 'challenging' })
    game.refreshMainMessages()
    await completionOf('challenging')
    console.log('finished challenging')
  }

  // blocking
  if (game.getCurrentAction().toDispatch && blocks[move]) {
    console.log('blocking...')
    game.allowers = new Set()
    game.setCurrentAction({ status: 'blocking' })
    game.refreshMainMessages()
    await completionOf('blocking')
  }

  // dispatching
  if (game.getCurrentAction().toDispatch) {
    console.log('dispatching...')
    game.setCurrentAction({ status: 'dispatching' })
    dispatches[move](game, blockAs)
    await game.refreshMainMessages()
    await completionOf('dispatching')
  }

  // check for winner
  console.log('checking for winner...')
  if (game.alive.length === 1) {
    console.log('winner winner chicken dinner')
    game.winner = game.alive[0].username
    game.endGame()
    return
  }
  console.log('no winner yet,', game.alive.length, 'players left')

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
