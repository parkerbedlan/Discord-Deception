const message = require('../../events/message')

const messageTemplates = {
  yourTurn: `**Your turn:**
:dollar: income
:money_with_wings: foreign aid (blocked by duke)
:gun: coup ($7)

:moneybag: tax
:pirate_flag: steal (blocked by captain and ambassador)
:dagger: assassinate ($3, blocked by contessa)
:repeat: exchange (ambassador)`,
  confirming: `:white_check_mark:  allow
:x: challenge`,
}

const actionToString = action => {
  let output = action.player.username + ' is attempting to '
  switch (action.type) {
    case 'foreign aid':
    case 'tax':
      return output + `collect ${action.type}`
    case 'steal':
      return output + `steal from ${action.target}`
    case 'assassinate':
      return output + `assassinate ${action.target}`
    case 'exchange':
      return output + `exchange`
  }
}

module.exports = async game => {
  const clearReactions = async player => {
    const mainMessage = await game.mainMessages.get(player).delete()
    game.mainMessages.set(player, await player.send(mainMessage.embeds[0]))
  }

  const situationMessage = player => {
    const action = game.getCurrentAction()
    if (!action) {
      return player === game.currentPlayer
        ? messageTemplates.yourTurn
        : `It's ${game.currentPlayer.username}'s turn...`
    } else if (action.confirming) {
      return player === game.currentPlayer
        ? actionToString(action) +
            '\n\n' +
            `Waiting for players to challenge...`
        : actionToString(action) + '\n\n' + messageTemplates['confirming']
    }
  }

  const addReactions = async message => {
    const player = message.channel.recipient
    const action = game.getCurrentAction()
    if (player === game.currentPlayer) {
      if (!game.actionStack.length) {
        await message.react('💵').catch(() => {})
        await message.react('💸').catch(() => {})
        if (game.wallets.get(game.currentPlayer) >= 7)
          await message.react('🔫').catch(() => {})
        await message.react('💰').catch(() => {})
        await message
          .react('%F0%9F%8F%B4%E2%80%8D%E2%98%A0%EF%B8%8F')
          .catch(() => {})
        if (game.wallets.get(game.currentPlayer) >= 3)
          await message.react('🗡').catch(() => {})
        await message.react('🔁').catch(() => {})
      }
    } else {
      if (action && action.confirming) {
        await message.react('✅').catch(() => {})
        await message.react('❌').catch(() => {})
      }
    }
  }

  await Promise.all(
    Array.from(game.mainMessages).map(async ([messagedPlayer, mainMessage]) => {
      await mainMessage.delete().catch(() => {
        console.log('failed to find old message')
      })
      const editedMessage = await messagedPlayer.send(
        mainMessage.embeds[0].setDescription(
          `\`\`\`${Array.from(game.players)
            .map(player => {
              let output =
                (player === messagedPlayer ? 'You' : player.username) + ':\t'
              output += '$' + game.wallets.get(player) + '\t'
              output += game.hands
                .get(player)
                .map(card =>
                  card.isFlipped || player === messagedPlayer
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
          )}`
        )
      )
      game.mainMessages.set(messagedPlayer, editedMessage)
      await addReactions(editedMessage)
      return editedMessage
    })
  )
}
