const { completionOf, complete } = require('../../general/resources/completion')

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
    if (game.alive.includes(game.getCurrentAction().target)) {
      game.flip(game.getCurrentAction().target)
      await completionOf('flipping')
      console.log('finished flipping')
    }
    complete('dispatching')
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
    if (game.alive.includes(game.getCurrentAction().target)) {
      game.flip(game.getCurrentAction().target)
      await completionOf('flipping')
      console.log('finished flipping')
    }
    complete('dispatching')
    console.log('triggered complete dispatching')
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
    console.log('picking')
    let actionPicks = new Map()
    let charCounter = 97
    for (const player of game.alive.filter(p => p !== game.currentPlayer)) {
      actionPicks.set(
        `:regional_indicator_${String.fromCharCode(charCounter)}:`,
        player
      )
      charCounter++
    }
    game.setCurrentAction({ status: 'picking', picks: actionPicks })

    game.refreshMainMessages()
    await completionOf('picking')
  }

  // charging
  if (charges[move]) {
    game.addToWallet(game.currentPlayer, -1 * charges[move])
    // game.refreshMainMessages()
  }

  // challenging
  if (challenges[move]) {
    game.allowers = new Set()
    game.setCurrentAction({ status: 'challenging' })
    game.refreshMainMessages()
    await completionOf('challenging')
    console.log('finished challenging')
    if (game.winner) return
  }

  // blocking
  if (false && game.getCurrentAction().toDispatch && blocks[move]) {
    console.log('blocking...')
    game.allowers = new Set()
    game.setCurrentAction({ status: 'blocking' })
    game.refreshMainMessages()
    await completionOf('blocking')
    game.refreshMainMessages()
    if (game.winner) return
  }

  // dispatching
  if (game.getCurrentAction().toDispatch) {
    console.log('dispatching...')
    game.setCurrentAction({ status: 'dispatching' })
    dispatches[move](game, blockAs)
    if (game.winner) return
    console.log('awaiting completion of dispatching')
    await completionOf('dispatching')
    console.log('hooray dispatching is completed!')
    // game.setCurrentAction({status: 'dispatched'})
  }

  console.log('finished dispatching')
  // finishing
  game.actionStack.pop()
  if (move === 'block') {
    complete('blocking')
    console.log('finished the blocking')
  } else {
    // next player
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.alive.length
    game.currentPlayer = game.alive[game.currentPlayerIndex]
    console.log('next player:', game.currentPlayer.tag)
    game.refreshMainMessages()
  }
}
