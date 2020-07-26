// eventually replace this with assimilation into reactionEmojis
const messageTemplates = {
  yourTurn: `**Your turn:**
:dollar: income
:money_with_wings: foreign aid (blocked by duke)
:gun: coup ($7)

:moneybag: tax
:pirate_flag: steal (blocked by captain and ambassador)
:dagger: assassinate ($3, blocked by contessa)
:repeat: exchange (ambassador)`,
}

const actionToString = action => {
  let output = `${action.player} is attempting to `
  switch (action.type) {
    case 'faid':
    case 'tax':
      return output + `collect ${action.type}`
    case 'steal':
      return output + `steal from ${action.target}`
    case 'assassinate':
      return output + `assassinate ${action.target}`
    case 'exchange':
      return output + `exchange`
    case 'block':
      return output + `block ${action.target} with ${action.blockAs}`
  }
}

const reactionEmojis = {
  allow: {
    identifier: '%E2%9C%85',
    display: ':white_check_mark: allow',
  },
  challenge: {
    identifier: '%E2%9D%8C',
    display: ':x: challenge',
  },
  blocks: {
    duke: {
      identifier: '%F0%9F%99%85',
      display: ':no_good: block as duke',
    },
    ambassador: {
      identifier: '%F0%9F%95%8A%EF%B8%8F',
      display: ':dove: block as ambassador',
    },
    captain: {
      identifier: '%E2%9A%94%EF%B8%8F',
      display: ':crossed_swords: block as captain',
    },
    contessa: {
      identifier: '%F0%9F%9B%A1%EF%B8%8F',
      display: ':shield: block as contessa',
    },
  },
}

const actionTypeToBlocks = {
  faid: { everyone: ['duke'], victimOnly: [] },
  steal: { everyone: [], victimOnly: ['ambassador', 'captain'] },
  assassinate: { everyone: [], victimOnly: ['contessa'] },
}

const getBlocks = (player, action) => {
  const actionBlocks = actionTypeToBlocks[action.type]
  if (!actionBlocks) return []

  output = []
  for (const block of actionBlocks.everyone) {
    output.push(reactionEmojis.blocks[block])
  }
  if (player === action.target) {
    for (const block of actionBlocks.victimOnly) {
      output.push(reactionEmojis.blocks[block])
    }
  }
  return output
}

module.exports = async game => {
  if (game.winner) return

  const situationMessage = player => {
    const action = game.getCurrentAction()
    if (!action) {
      return player === game.currentPlayer
        ? messageTemplates.yourTurn
        : `It's ${game.currentPlayer}'s turn...`
    } else if (
      action.status === 'challenging' ||
      action.status === 'blocking'
    ) {
      console.log('oh boy here we go')
      console.log(JSON.stringify(getBlocks(player, action)))

      return player === game.currentPlayer
        ? actionToString(action) +
            '\n\n' +
            `Waiting for players to challenge...`
        : actionToString(action) +
            '\n\n' +
            reactionEmojis.allow.display +
            '\n' +
            (action.status === 'challenging'
              ? reactionEmojis.challenge.display + '\n'
              : '') +
            getBlocks(player, action)
              .map(block => block.display)
              .join('\n')
    } else if (action.status === 'flipping') {
      return player === action.flipper
        ? `**Flip a card, any card:**
        :one: ${game.hands.get(action.flipper)[0].influence}
        :two: ${game.hands.get(action.flipper)[1].influence}`
        : `${action.flipper} is flipping over a card...`
    } else if (action.status === 'picking') {
      return player === game.currentPlayer
        ? `**Pick your victim.**\n${Array.from(action.picks)
            .map(([emoji, playerPick]) => emoji + ' ' + playerPick.username)
            .join('\n')}`
        : `It's ${game.currentPlayer}'s turn...`
    }
    return `oof, no message for ${action.status} yet`
  }

  const addReactions = message => {
    const player = message.channel.recipient
    const action = game.getCurrentAction()
    if (player === game.currentPlayer) {
      if (!action) {
        message.react('💵').catch(() => {})
        message.react('💸').catch(() => {})
        if (game.wallets.get(game.currentPlayer) >= 7)
          message.react('🔫').catch(() => {})
        message.react('💰').catch(() => {})
        message.react('%F0%9F%8F%B4%E2%80%8D%E2%98%A0%EF%B8%8F').catch(() => {})
        if (game.wallets.get(game.currentPlayer) >= 3)
          message.react('🗡').catch(() => {})
        message.react('🔁').catch(() => {})
      } else if (action.status === 'picking') {
        for (let i = 166; i < 166 + action.picks.size; i++) {
          message
            .react(`%F0%9F%87%${i.toString(16).toUpperCase()}`)
            .catch(() => {})
        }
      }
    } else {
      if (
        action &&
        (action.status === 'challenging' || action.status === 'blocking')
      ) {
        message.react('✅').catch(() => {})
        if (action.status === 'challenging') message.react('❌').catch(() => {})
        getBlocks(player, action).forEach(block =>
          message.react(block.identifier).catch(() => {})
        )
      }
    }

    if (action && action.status === 'flipping' && action.flipper === player) {
      message.react('1️⃣').catch(() => {})
      message.react('2️⃣').catch(() => {})
    }
  }

  Array.from(game.mainMessages).forEach(([messagedPlayer, mainMessage]) => {
    console.log('messaging', messagedPlayer.tag, '...')
    mainMessage
      .delete()
      .then(() => {
        messagedPlayer
          .send(
            mainMessage.embeds[0].setDescription(
              `\`\`\`css\n${Array.from(game.players)
                .map(player => {
                  let output =
                    (player === messagedPlayer ? 'You' : player.username) +
                    ':\t'
                  output += '$' + game.wallets.get(player) + '\t'
                  output += game.hands
                    .get(player)
                    .map(card =>
                      card.isFlipped
                        ? `[${card.influence}]`
                        : player === messagedPlayer
                        ? card.influence
                        : '❔'
                    )
                    .join(', ')
                  return output
                })
                .join(
                  '\n'
                )}\`\`\`\nLast move:   \`${game.getLastAction()}\`\n\n${situationMessage(
                messagedPlayer
              )}`
            )
          )
          .then(m => {
            game.mainMessages.set(messagedPlayer, m)
            console.log('reacting to', m.channel.recipient.tag)
            addReactions(m)
            console.log('finished reacting to', m.channel.recipient.tag)
          })
      })
      .catch(() => console.log('FAILED sending message to', messagedPlayer.tag))
  })

  /*
  await Promise.all(
    Array.from(game.mainMessages).map(async ([messagedPlayer, mainMessage]) => {
      await mainMessage.delete().catch(() => {
        console.log('failed to find old message')
      })
      const newMessage = await messagedPlayer.send(
        mainMessage.embeds[0].setDescription(
          `\`\`\`css\n${Array.from(game.players)
            .map(player => {
              let output =
                (player === messagedPlayer ? 'You' : player.username) + ':\t'
              output += '$' + game.wallets.get(player) + '\t'
              output += game.hands
                .get(player)
                .map(card =>
                  card.isFlipped
                    ? `[${card.influence}]`
                    : player === messagedPlayer
                    ? card.influence
                    : '❔'
                )
                .join(', ')
              return output
            })
            .join(
              '\n'
            )}\`\`\`\nLast action:   \`${game.getLastAction()}\`\n\n${situationMessage(
            messagedPlayer
          )}` //\n\ndebugging stuff:\`\`\`${JSON.stringify(game.actionStack,null,2)}\`\`\``
        )
      )
      game.mainMessages.set(messagedPlayer, newMessage)
      addReactions(newMessage)
      return newMessage
    })
  )
  */
}
