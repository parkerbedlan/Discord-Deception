const clearReactions = async player => {
  const mainMessage = await game.mainMessages.get(player).delete()
  game.mainMessages.set(player, await player.send(mainMessage.embeds[0]))
}

module.exports = async game => {
  Array.from(game.mainMessages).map(async ([messagedPlayer, mainMessage]) => {
    const deletedMessage = await game.mainMessages.get(messagedPlayer).delete()
    game.mainMessages.set(
      messagedPlayer,
      await messagedPlayer.send(deletedMessage.embeds[0])
    )
  })
}
