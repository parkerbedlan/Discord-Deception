// mafia-specific (todo: make it generalized)

// todo: on the first night, mafia only get to learn each others' identities; they don't get to kill
// todo: make it less honor systemy
// todo: make list of all Game properties (some documentation), separating universal Game properties and Mafia Game properties

const { Permissions, MessageEmbed, MessageFlags } = require('discord.js')
const root = require.main
const { runningGames, shuffleArray, botchats } = root.require('./bot.js')
const { execute: startNight, mafiaNight, copNight } = root.require(
  './mafia/stages/startNight'
)
const {
  execute: startMorning,
  startAccusing,
  startVoting,
  startHanging,
} = root.require('./mafia/stages/startMorning')
const endGame = root.require('./mafia/stages/endGame')

const shortToFull = {
  m: 'mafia',
  i: 'innocent',
  c: 'cop',
}

module.exports = async msg => {
  await msg.channel.send(
    'Let\'s play some Mafia! **Connect to the voice channel "Town Hall"**. You\'ll learn your secret identity once everyone has connected...'
  )

  const game = runningGames[msg.guild]
  if (game.status == 'playing') return
  game.status = 'playing'
  game.players.delete(msg.client.user)
  game.players.add(game.host)
  console.log(
    `Starting ${game.type} game with ${game.players.size} player${
      game.players.size > 1 ? 's' : ''
    }`
  )

  game.numToPlayer = new Map()
  game.playerToNum = new Map()
  let i = 1
  game.players.forEach(player => {
    game.playerToNum.set(player, i)
    game.numToPlayer.set(i++, player)
  })
  for (const [k, v] of game.numToPlayer) {
    console.log(`${k}: ${v.username}`)
  }

  game.playersRole = await game.guild.roles.create({
    data: {
      name: 'Players',
      hoist: true,
      position: 1,
      mentionable: true,
      color: '#8c9eff',
    },
  })

  game.deadRole = await game.guild.roles.create({
    data: {
      name: 'Dead',
      hoist: true,
      position: 2,
      mentionable: false,
      color: '#a83a32',
    },
  })

  game.identitySets = {
    mafia: new Set(),
    innocent: new Set(),
  }
  game.playerToIdentity = new Map()
  game.playerToDeadIdentity = new Map()
  game.dead = new Set()
  game.alive = new Set()
  game.players.forEach(player => {
    game.alive.add(player)
  })

  let identityHat = []
  for (let j = 0; j < Math.ceil(game.players.size * 0.226); j++)
    identityHat.push('m')
  if (game.players.size > 6) {
    game.identitySets.cop = new Set()
    for (let i = 0; i < Math.ceil(game.players.size * 0.051); i++)
      identityHat.push('c')
  }
  while (identityHat.length < game.players.size) identityHat.push('i')

  identityHat = shuffleArray(identityHat)
  console.log(identityHat)

  game.players.forEach(async player => {
    // give public 'Players' role
    const member = await game.guild.member(player)
    member.roles.add(game.playersRole)
    // pull their secret identity from a hat
    const identity = shortToFull[identityHat.pop()]
    console.log(`${player.username}: ${identity}`)
    game.playerToIdentity.set(player, identity)
    game.identitySets[identity].add(player)
  })

  game.categoryChannel = await game.guild.channels.create('Mafia Game', {
    type: 'category',
    position: 1,
    permissionOverwrites: [
      {
        id: game.guild.roles.cache.find(r => r.name == '@everyone'),
        type: 'role',
        deny: new Permissions(2147483647),
      },
      {
        id: game.playersRole,
        type: 'role',
        allow: new Permissions(37162048),
        deny: new Permissions(2109796799),
      },
      {
        id: game.deadRole,
        type: 'role',
        allow: new Permissions(1115136),
        deny: new Permissions(2145843711),
      },
    ],
  })

  game.generalVoiceChannel = await game.guild.channels.create('Town Hall', {
    parent: game.categoryChannel,
    type: 'voice',
    userLimit: game.players.size,
  })

  game.on('revealIdentities', async () => {
    await Promise.all(
      Array.from(game.players).map(player => {
        return player.send(
          `Your secret identity is: ||**${game.playerToIdentity.get(
            player
          )}**||. Shhh, don't tell anyone...`
        )
      })
    )
    await Promise.all(
      Array.from(game.players).map(async player => {
        const message = await player.send(
          "**Raise your hand** once you've seen your secret identity so the game can start."
        )
        return message.react('✋')
      })
    )
  })

  game.on('startNight', () => {
    startNight(game)
    // game.messagePlayers('Night time')
  })
  game.on('mafiaNight', () => {
    mafiaNight(game)
  })
  game.on('copNight', () => {
    copNight(game)
  })
  game.on('startMorning', () => {
    startMorning(game)
  })
  game.on('startAccusing', () => {
    startAccusing(game)
  })
  game.on('startVoting', () => {
    startVoting(game)
  })
  game.on('startHanging', () => {
    startHanging(game)
  })
  game.on('endGame', () => {
    endGame(game)
  })

  await Promise.all(
    Array.from(game.players).map(async player => {
      console.log('attempting to move', player.tag)
      return game.guild
        .member(player)
        .edit({ channel: game.generalVoiceChannel })
    })
  ).catch(() => 'failed')
}
