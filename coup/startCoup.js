// todo: special setup for 2 person games

const { runningGames, shuffleArray } = require('../bot')
const { MessageEmbed } = require('discord.js')
const refreshMainMessages = require('./commands/refreshMainMessages')
const dispatch = require('./commands/dispatch')
const income = require('./commands/income')
const tax = require('./commands/tax')
const nextAction = require('./commands/nextAction')
const endGame = require('../general/commands/endGame')
const allow = require('./commands/allow')
const clearAllReactions = require('./commands/clearAllReactions')
const challenge = require('./commands/challenge')

module.exports = async msg => {
  const game = runningGames[msg.guild]
  game.status = 'playing'
  game.players.delete(msg.client.user)
  game.players.add(game.host)
  console.log(
    `Starting ${game.type} game with ${game.players.size} player${
      game.players.size > 1 ? 's' : ''
    }`
  )
  msg.reply(`Starting a game of coup with ${game.players.size} players!`)

  game.alive = Array.from(game.players)

  const cardCopies = Math.max(3, game.players.size * Math.floor(2 / 5) + 1)
  game.deck = Array(cardCopies)
    .fill(['duke', 'captain', 'ambassador', 'assassin', 'contessa'])
    .flat()
  game.deck = shuffleArray(game.deck)

  game.hands = new Map()
  for (const player of game.players) {
    game.hands.set(player, [
      { influence: game.deck.pop(), isFlipped: false },
      { influence: game.deck.pop(), isFlipped: false },
    ])
  }

  game.wallets = new Map()
  for (const player of game.players) {
    game.wallets.set(player, 2)
  }

  game.history = ['Each player received 2 cards and 2 tokens']

  game.currentPlayerIndex = Math.floor(Math.random() * game.alive.length)
  game.currentPlayer = game.alive[game.currentPlayerIndex]

  game.currentAction = []

  //array should be actionStack and getCurrentAction() should be peek

  game.allowers = new Set()

  game.on('refreshMainMessages', async () => await refreshMainMessages(game))

  game.on('income', player => income(game, player))

  game.on('tax', player => tax(game, player))

  game.on('nextAction', () => nextAction(game))

  game.on('allow', player => allow(game, player))

  game.on('challenge', player => challenge(game, player))

  game.on('clearAllReactions', () => clearAllReactions(game))

  game.on('dispatch', () => dispatch(game))

  game.on('endGame', () => endGame(game))

  game.mainMessages = new Map()
  await Promise.all(
    game.alive.map(async messagedPlayer => {
      const mainMessage = await messagedPlayer.send(
        new MessageEmbed()
          .setColor('#8c9eff')
          .setDescription('Click me to play!')
      )
      game.mainMessages.set(messagedPlayer, mainMessage)
      return mainMessage
    })
  )
  await refreshMainMessages(game)
}
