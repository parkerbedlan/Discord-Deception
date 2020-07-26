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
const blocks = { faid: true, steal: true, assassinate: true }
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
  exchange: async game => {
    // let exchangeOptions = new Map()
    // let counter = 1
    // for (card of game.hands.get(game.currentPlayer)) {
    //   if (!card.isFlipped) {
    //     exchangeOptions.set(`${counter++}%EF%B8%8F%E2%83%A3`, card.influence)
    //   }
    // }
    // exchangeOptions.set(`${counter++}%EF%B8%8F%E2%83%A3`, game.deck.pop())
    // exchangeOptions.set(`${counter}%EF%B8%8F%E2%83%A3`, game.deck.pop())

    game.setCurrentAction({
      status: 'exchanging',
      exchangeOptions: [
        ...game.hands
          .get(game.currentPlayer)
          .filter(card => !card.isFlipped)
          .map(card => card.influence),
        game.deck.pop(),
        game.deck.pop(),
      ],
    })
    game.refreshMainMessages()
    await completionOf('exchanging')
    complete('dispatching')
  },
  block: (game, blockAs) => {
    game.setAction(game.actionStack.length - 2, { toDispatch: false })
    complete('dispatching')
  },
}

module.exports = async (game, player, move, blockAs = null) => {
  const index = game.actionStack.length

  game.actionStack.push({
    type: move,
    player,
    target: blockAs ? game.getCurrentAction().player : undefined,
    toDispatch: true,
    blockAs,
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
    game.setAction(index, { status: 'picking', picks: actionPicks })

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
    game.setAction(index, { status: 'challenging' })
    game.refreshMainMessages()
    await completionOf('challenging')
    console.log('finished challenging')
    if (game.winner) return
  }

  // blocking
  if (game.actionStack[index].toDispatch && blocks[move]) {
    if (game.actionStack[index].status !== 'blocking') {
      game.allowers = new Set()
      game.setAction(index, { status: 'blocking' })
      game.refreshMainMessages()
    }
    console.log('awaiting the completion of blocking')
    await completionOf('blocking')
    console.log('hooray blocking completed')
    game.refreshMainMessages()
    if (game.winner) return
  }

  // dispatching
  if (game.actionStack[index].toDispatch) {
    console.log('dispatching...')
    game.setAction(index, { status: 'dispatching' })
    dispatches[move](game, blockAs)
    if (game.winner) return
    console.log('awaiting completion of dispatching')
    await completionOf('dispatching')
    console.log('hooray dispatching is completed!')
  }

  console.log('finished move', move)
  // finishing
  game.actionStack.pop()
  if (move === 'block') {
    complete('blocking')
    game.currentPlayer = game.getCurrentAction().player
  } else {
    // next player
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.alive.length
    game.currentPlayer = game.alive[game.currentPlayerIndex]
    console.log('next player:', game.currentPlayer.tag)
    game.refreshMainMessages()
  }
}
