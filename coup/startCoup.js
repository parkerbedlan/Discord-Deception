// todo: special setup for 2 person games

const { runningGames, shuffleArray } = require('../bot')
const { MessageEmbed } = require('discord.js')
const refreshMainMessages = require('./commands/refreshMainMessages')
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

  game.hands = new Map() // player -> [[card, isFlipped], [card, isFlipped]]
  for (const player of game.players) {
    game.hands.set(player, [
      [game.deck.pop(), false],
      [game.deck.pop(), false],
    ])
  }

  game.wallets = new Map() // player -> amount of money in wallet
  for (const player of game.players) {
    game.wallets.set(player, 2)
  }

  game.history = ['Each player received 2 cards and 2 tokens']

  game.currentPlayer = game.alive[Math.floor(Math.random() * game.alive.length)]

  game.currentAction = []

  game.on('refreshMainMessages', () =>
    require('./commands/refreshMainMessages')(game)
  )

  game.on('income', player => require('./commands/income')(game, player))

  game.on('nextAction', () => require('./commands/nextAction')(game))

  game.on('endGame', () => require('../general/commands/endGame')(game))

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
