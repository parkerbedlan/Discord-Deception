// generalized
// basically a stable version of clearPast
// used to be at the end of endGame, but deleting the public-record right when it finds out a team wins is too sudden

const root = require.main
const { runningGames } = root.require('./bot.js')
module.exports = game => {
  if (game.type == 'mafia') {
    game.playersRole.edit({ color: 'DEFAULT' })
    game.playersRole.delete()
    game.deadRole.edit({ color: 'DEFAULT' })
    game.deadRole.delete()
    game.categoryChannel.delete()
    game.generalVoiceChannel.delete().catch(() => {})
  }

  delete runningGames[game.guild]
}
