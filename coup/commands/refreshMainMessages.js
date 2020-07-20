messageTemplates = {
  yourTurn: `**Your turn:**
:dollar: income
:money_with_wings: foreign aid (blocked by duke)
:gun: coup ($7)

:moneybag: tax
:pirate_flag: steal (blocked by captain and ambassador)
:dagger: assassinate ($3, blocked by contessa)
:repeat: exchange (ambassador)`,
}

module.exports = async game => {
  await Promise.all(
    Array.from(game.mainMessages).map(async ([messagedPlayer, mainMessage]) => {
      console.log('refreshing', messagedPlayer.username)
      return await mainMessage.edit(
        mainMessage.embeds[0].setDescription(
          `\`\`\`${Array.from(game.players)
            .map(player => {
              let output =
                (player === messagedPlayer ? 'You' : player.username) + ':\t'
              output += '$' + game.wallets.get(player) + '\t'
              output += game.hands
                .get(player)
                .map(card =>
                  card[1] || player === messagedPlayer ? card[0] : '❔'
                )
                .join(', ')
              return output
            })
            .join('\n')}\`\`\`\nLast move:   \`${
            game.history[game.history.length - 1]
          }\`\n\n${
            messagedPlayer === game.currentPlayer
              ? messageTemplates.yourTurn
              : `It's ${game.currentPlayer.username}'s turn...`
          }`
        )
      )
    })
  )
  // await do reaction stuff
  if (!game.currentAction.length) {
    const mainMessage = game.mainMessages.get(game.currentPlayer)
    await mainMessage.react('💵')
    await mainMessage.react('💸')
    if (game.wallets.get(game.currentPlayer) >= 7) await mainMessage.react('🔫')
    await mainMessage.react('💰')
    await mainMessage.react('%F0%9F%8F%B4%E2%80%8D%E2%98%A0%EF%B8%8F')
    if (game.wallets.get(game.currentPlayer) >= 3) await mainMessage.react('🗡')
    await mainMessage.react('🔁')
  }
}
