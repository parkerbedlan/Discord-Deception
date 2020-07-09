// generalized
// basically a stable version of clearPast
// used to be at the end of endGame, but deleting the public-record right when it finds out a team wins is too sudden

const root = require.main
const { runningGames, getGeneralVoiceChannel } = root.require('./bot.js')

module.exports = async game => {
  if (game.type == 'mafia') {
    const moveToChannel = getGeneralVoiceChannel(game.guild)
    console.log(moveToChannel)
    await Promise.all(
      Array.from(game.players).map(player => {
        return game.guild.member(player).edit({ channel: moveToChannel })
      })
    )
    game.playersRole.edit({ color: 'DEFAULT' })
    game.playersRole.delete()
    game.deadRole.edit({ color: 'DEFAULT' })
    game.deadRole.delete()
    game.categoryChannel.delete()
    game.generalVoiceChannel.delete().catch(() => {})
  }

  delete runningGames[game.guild]
}
