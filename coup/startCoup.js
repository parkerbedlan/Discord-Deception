// todo: special setup for 2 person games

const { runningGames, shuffleArray } = require('../bot')
const { MessageEmbed } = require('discord.js')
const refreshMainMessages = require('./commands/refreshMainMessages')
const endGame = require('../general/commands/endGame')
const startMove = require('./commands/startMove')
const allow = require('./commands/allow')
const challenge = require('./commands/challenge')
const flip = require('./commands/flip')

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
  game.addToWallet = (player, amount) =>
    game.wallets.set(player, game.wallets.get(player) + amount)

  game.history = ['Each player received 2 cards and 2 tokens']
  game.getLastAction = () => game.history[game.history.length - 1]

  game.currentPlayerIndex = Math.floor(Math.random() * game.alive.length)
  game.currentPlayer = game.alive[game.currentPlayerIndex]

  game.actionStack = []
  game.getCurrentAction = () => game.actionStack[game.actionStack.length - 1]
  game.setCurrentAction = action =>
    (game.actionStack[game.actionStack.length - 1] = {
      ...game.getCurrentAction(),
      ...action,
    })

  game.allowers = new Set()

  game.refreshMainMessages = async () => await refreshMainMessages(game)

  game.startMove = async (move, blockAs) => await startMove(game, move, blockAs)

  game.allow = player => allow(game, player)

  game.challenge = async player => await challenge(game, player)

  game.flip = async (player, cardIndex) => await flip(game, player, cardIndex)

  game.endGame = () => endGame(game)

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
