// mafia-specific
const {
  Permissions,
  MessageEmbed,
  PartialGroupDMChannel,
} = require('discord.js')

module.exports = {
  execute: async game => {
    console.log('morning')
    game.firstNight = false

    // undo night permissions
    game.muted = false
    game.generalVoiceChannel = await game.generalVoiceChannel
      .clone()
      .catch(() => {})
    game.generalTextChannel.overwritePermissions([
      {
        id: game.guild.roles.cache.find(r => r.name == '@everyone'),
        type: 'role',
        deny: new Permissions(2147483647),
      },
      {
        id: game.playersRole,
        type: 'role',
        allow: new Permissions(3607616),
        deny: new Permissions(2143876031), //back to normal
      },
      {
        id: game.deadRole,
        type: 'role',
        allow: new Permissions(1049600),
        deny: new Permissions(2146434047),
      },
    ])

    // announce night kill and check for winner
    game.generalTextChannel.send(
      `The morning has come, and it's a beautiful day outside. Birds are singing, flowers are blooming...`
    )
    if (game.nightKill) {
      game.generalTextChannel.send(`and ${game.nightKill} is dead.`)
      game.alive.delete(game.nightKill)
      game.dead.add(game.nightKill)
      game.guild.member(game.nightKill).roles.remove(game.playersRole)
      game.guild.member(game.nightKill).roles.add(game.deadRole)
      game.playerToDeadJob.set(game.nightKill, 'unknown')
      game.jobSets.cop.delete(game.nightKill)
      game.nightKill = null

      if (winnerCheck(game)) {
        console.log('winner winner chicken dinner: ' + game.winner)
        game.emit('endGame')
        return
      } else console.log('no winner yet')
    } else {
      // game.generalTextChannel.send("and the Mafia were too busy playing poker with the family to kill anyone last night.")
    }

    // trial
    game.generalTextChannel.send('Anyways, time to hang someone!')

    game.emit('startAccusing')
  },
  startAccusing,
  startVoting,
  startHanging,
}

async function startAccusing(game) {
  let aliveStr = ''
  let deadStr = ''
  for (const [num, player] of game.numToPlayer) {
    let paddedNum = ' ' + num
    paddedNum = paddedNum.substring(paddedNum.length - 2)
    if (game.alive.has(player)) aliveStr += `${paddedNum}: ${player.username}\n`
    else if (game.dead.has(player))
      deadStr += `${player.username} (${game.playerToDeadJob.get(player)})\n`
    else console.log(player + ' is neither dead nor alive??')
  }
  if (!deadStr) deadStr = 'None... yet :smiling_imp:'

  game.allPlayersMsgEmbed = new MessageEmbed()
    .setColor('#8c9eff')
    .addFields(
      { name: 'Dead', value: deadStr },
      { name: 'Alive', value: aliveStr }
    )
  game.allPlayersMsg = await game.generalTextChannel.send(
    game.allPlayersMsgEmbed
  )
  game.allPlayersMsg.pin().catch(console.error)

  // todo: wait some time to force discussion before allowing ?nominate or ?vote

  game.allPlayersMsg
    .unpin()
    .catch(console.error)
    .then(async () => {
      game.allPlayersMsg
        .delete()
        .then(async () => {
          game.allPlayersMsg = await game.generalTextChannel.send(
            game.allPlayersMsgEmbed
          )
          game.allPlayersMsg.pin().catch(console.error)
          game.generalTextChannel.send(
            'You can now DM me an accusation using ?accuse and their number above. Everyone must submit an accusation before we move onto voting.'
          )
        })
        .catch(console.error)
    })
    .catch(console.error)
  game.votes = new Map() // voter -> suspect
  game.voteTally = new Map() // suspect -> set of voters
  game.status = 'accusing'
  // idea: x accusations left
  game.alive.forEach(player => {
    player.send(game.allPlayersMsgEmbed)
    player.send(
      `Once you've decided who to accuse, DM me here \"?accuse 0\" (replace 0 with their number)\nFeel free to discuss in <#${game.generalTextChannel.id}> until you're ready.`
    )
  })
}

async function startVoting(game) {
  game.status = 'playing'

  if (!game.revote) {
    game.generalTextChannel.send(
      'The last accusation has been received. Here are the results:'
    )
    game.voteTally = new Map(
      [...game.voteTally.entries()].sort((a, b) => b[1].size - a[1].size)
    )
    let accuseDisplay = ''
    for (const [player, voters] of game.voteTally)
      accuseDisplay += `${voters.size} votes: ${player.username}\n\t${
        '[' +
        Array.from(voters)
          .map(p => p.username)
          .join(', ') +
        ']'
      }\n`
    game.accuseMsg = await game.generalTextChannel.send(
      new MessageEmbed()
        .setColor('#8c9eff')
        .setTitle('Accusations')
        .setDescription(accuseDisplay)
    )

    const amts = game.voteTally.values()
    const amt1 = amts.next().value.size
    let amt2, amt3
    if (game.voteTally.size >= 2) {
      amt2 = amts.next().value.size
    }
    if (game.voteTally.size >= 3) {
      amt3 = amts.next().value.size
    }
    const accuseds = game.voteTally.keys()
    game.suspects = new Map()
    game.suspectsDisplay = ''
    if (game.voteTally.size >= 3 && amt2 == amt3) {
      const susa = accuseds.next().value
      const susb = accuseds.next().value
      const susc = accuseds.next().value
      game.suspects = new Map([
        ['a', susa],
        ['b', susb],
        ['c', susc],
      ])
      game.suspectsDisplay = `a: ${susa.username}\nb: ${susb.username}\nc: ${susc.username}`
    } else if (game.voteTally.size > 1) {
      const susa = accuseds.next().value
      const susb = accuseds.next().value
      game.suspects = new Map([
        ['a', susa],
        ['b', susb],
      ])
      game.suspectsDisplay = `a: ${susa.username}\nb: ${susb.username}`
    } // only one person accused
    else {
      const susa = accuseds.next().value
      game.suspects = new Map([['a', susa]])
      game.suspectsDisplay = `a: ${susa.username}`
      game.votes = new Map()
      game.voteTally = new Map([[susa, game.alive]])
      game.emit('startHanging')
      return
    }
  }

  game.generalTextChannel.send(
    'Here are the final suspects to vote on killing:'
  )
  game.suspectsMsgEmbed = new MessageEmbed()
    .setColor('#8c9eff')
    .setTitle('Suspects to vote on')
    .setDescription(game.suspectsDisplay)
  game.suspectsMsg = await game.generalTextChannel.send(game.suspectsMsgEmbed)

  game.votes = new Map()
  game.voteTally = new Map()
  game.status = 'voting'
  game.generalTextChannel.send(
    "Whenever you're ready, DM me your vote using ?vote and their letter above. Everyone must vote, including the suspects."
  )
  game.alive.forEach(player => {
    player.send(game.suspectsMsgEmbed)
    player.send(
      `Once you've decided who to vote for, DM me here \"?vote z\" (replace z with their letter)\nFeel free to discuss in <#${game.generalTextChannel.id}> until you're ready.`
    )
  })
}

async function startHanging(game) {
  game.status = 'playing'

  if (game.voteTally.size > 1) {
    game.voteTally = new Map(
      [...game.voteTally.entries()].sort((a, b) => b[1].size - a[1].size)
    )

    game.generalTextChannel.send('The results are in: ')
    let voteDisplay = ''
    for (const [player, voters] of game.voteTally)
      voteDisplay += `${voters.size} votes: ${player.username}\n\t${
        '[' +
        Array.from(voters)
          .map(p => p.username)
          .join(', ') +
        ']'
      }\n`
    game.voteMsg = await game.generalTextChannel.send(
      new MessageEmbed()
        .setColor('#8c9eff')
        .setTitle('Voting Results')
        .setDescription(voteDisplay)
    )
  } else {
    game.generalTextChannel.send(
      "Welp, only one person got accused, so I guess it's kind of implied what happens next."
    )
  }

  const amts = game.voteTally.values()
  const amt1 = amts.next().value.size
  let amt2
  if (game.voteTally.size > 1) {
    amt2 = amts.next().value.size
    if (amt1 == amt2) {
      if (game.suspects.size == 3) {
        if (amt2 > amts.next().value.size) {
          const suses = game.voteTally.keys()
          const susa = suses.next().value
          const susb = suses.next().value
          game.suspects = new Map([
            ['a', susa],
            ['b', susb],
          ])
          game.suspectsDisplay = `a: ${susa.username}\nb: ${susb.username}`
        }
      }

      if (!game.revote) {
        game.revote = true
        game.generalTextChannel.send(
          "Welp, it's a tie. The town will get only one chance to revote, and if it's a tie again, nobody will be hanged and we will go straight to night."
        )
        game.emit('startVoting')
        return
      } else {
        game.generalTextChannel.send(
          'The town was unable to agree on who to kill, and the sun set before they were able to decide. Nobody was killed today.'
        )
        game.emit('startNight')
        return
      }
    }
  }

  game.hangKill = game.voteTally.keys().next().value
  game.generalTextChannel.send(`lol get rekt ${game.hangKill.username}, u ded`)
  game.generalTextChannel.send(
    `btw their secret identity was ${game.playerToJob.get(game.hangKill)}`
  )

  // kill them
  game.alive.delete(game.hangKill)
  game.dead.add(game.hangKill)
  game.guild.member(game.hangKill).roles.remove(game.playersRole)
  game.guild.member(game.hangKill).roles.add(game.deadRole)
  game.playerToDeadJob.set(game.hangKill, game.playerToJob.get(game.hangKill))
  if (game.jobSets.cop) game.jobSets.cop.delete(game.hangKill)
  game.hangKill = null

  if (winnerCheck(game)) {
    console.log('winner winner chicken dinner: ' + game.winner)
    game.emit('endGame')
    return
  } else console.log('no winner yet')

  // todo: add some time to be shocked and discuss
  game.generalTextChannel.send(
    'All that voting has made everyone really sleepy.'
  )
  game.emit('startNight')
}

function winnerCheck(game) {
  console.log('checking for winner')
  let mafiaAllDead = true
  for (const player of game.jobSets.mafia) {
    if (game.alive.has(player)) {
      mafiaAllDead = false
      break
    }
  }
  if (mafiaAllDead) {
    game.winner = 'The Town'
    return true
  }

  let innoAllDead = true
  for (const player of game.jobSets.innocent) {
    if (game.alive.has(player)) {
      innoAllDead = false
      break
    }
  }
  if (innoAllDead) {
    game.winner = 'The Mafia'
    return true
  }
  return false
}
