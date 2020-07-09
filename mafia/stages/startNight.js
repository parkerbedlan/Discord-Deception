// mafia-specific
const { Permissions, MessageEmbed } = require('discord.js')
const { botchats } = require('../../bot')
const createBotchat = require.main.require('./general/resources/createBotchat')

module.exports = {
  execute: async game => {
    console.log('night')

    // restrict permissions
    game.muted = true
    game.setPermissions('night')

    await Promise.all(
      Array.from(game.alive).map(player => {
        if (botchats.has(player)) botchats.delete(player)
        console.log('muting', player.tag)
        return game.guild.member(player).edit({ mute: true })
      })
    ).catch(() => {
      console.log('failed')
    })

    // todo: add sound effect for this
    game.messagePlayers(
      'The Night has fallen, and the Townspeople go to sleep...'
    )

    game.remainingPlayers = ''
    game.alive.forEach(user => (game.remainingPlayers += user.username + '\n'))

    game.emit('mafiaNight')
  },

  mafiaNight,
  copNight,
}

function mafiaNight(game) {
  if (!game.firstNight) {
    // not the first night
    // todo: assign each player a number at beginning of game, show in order but exclude dead ones
    // todo: show a bottom of chat timer - if they can't come to a consensus in the given time, they don't get to kill anyone
    // mafia kill
    game.messagePlayers('The mafia are selecting their next victim...')

    let [mafiaBC, mafiaBCstr] = createBotchat(game.identitySets.mafia)

    mafiaBC.forEach(user => {
      if (mafiaBC.size > 1)
        user.send(
          'This is a chat where the mafia can speak freely and must decide who to kill. These are the remaining mafia:\n' +
            mafiaBCstr
        )
      user.send(
        new MessageEmbed()
          .setColor('#8c9eff')
          .setTitle(
            `The first use of "?kill **victim_username_here**" will kill them, so ${
              mafiaBC.size == 1 ? 'think' : 'discuss'
            } carefully before using it!`
          )
          .setDescription(`${game.remainingPlayers}`)
      )
    })
  } else if (game.identitySets.mafia.size > 1) {
    // more than 1 mafia and the first night
    game.messagePlayers('The mafia are finding out who their partners are...')
    let mafiaStr = ''
    game.identitySets.mafia.forEach(user => (mafiaStr += user.username + '\n'))
    game.identitySets.mafia.forEach(user =>
      user.send('These are your partners in crime:\n' + mafiaStr)
    )
    game.emit('copNight')
  } // only 1 mafia and the first night
  else {
    game.emit('copNight')
  }
}

// idea: alternate rule - cop spooned a random unknown living mafia identity like in the org.ntnu.no/mafia rules
function copNight(game) {
  if (game.identitySets.cop) {
    //there has ever been a cop in the game
    game.messagePlayers(`The cops are investigating a suspect...`)
  } else {
    game.emit('startMorning')
    return
  }

  let mafiaJustKilledLastCop = true
  for (const cop of game.identitySets.cop) {
    if (game.nightKill != cop) {
      mafiaJustKilledLastCop = false
      break
    }
  }

  if (game.identitySets.cop.size && !mafiaJustKilledLastCop) {
    //there is currently a living cop in the game
    let copBC, copBCstr
    ;[copBC, copBCstr] = createBotchat(game.identitySets.cop)
    copBC.forEach(user => {
      if (copBC.size > 1)
        user.send(
          'This is a chat where the cops can speak freely and must decide who to kill. These are the remaining cops:\n' +
            copBCstr
        )
      user.send(
        new MessageEmbed()
          .setColor('#8c9eff')
          .setTitle(
            `The first use of "?inspect **suspect_username_here**" will reveal their identity to ${
              copBC.size == 1 ? 'you, so think' : 'all the cops, so discuss'
            } carefully before using it!`
          )
          .setDescription(`${game.remainingPlayers}`)
      )
    })
  } else {
    // wait random time between 8 and 16 seconds to make the mafia think the cop is alive
    setTimeout(() => {
      game.emit('startMorning')
    }, (8 + Math.random() * 8) * 1000)
  }
}
