// currently mafia only, but could easily be generalized
// when everyone joins the voice channel, the game begins.

const { runningGames } = require('../bot')

module.exports = (client, oldState, newState) => {
  if (
    oldState.channelID !== newState.channelID &&
    !newState.guild.member(newState.id).user.bot &&
    newState.channel &&
    runningGames[newState.guild] &&
    runningGames[newState.guild].firstNight &&
    runningGames[newState.guild].generalVoiceChannel &&
    runningGames[newState.guild].generalVoiceChannel === newState.channel &&
    runningGames[newState.guild].players.size === newState.channel.members.size
  ) {
    runningGames[newState.guild].emit('revealIdentities')
  }
}
