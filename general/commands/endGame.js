// generalized

const { getGeneralTextChannel } = require('../../bot')

module.exports = async game => {
  game.status = 'ended'
  const winningTeam = game.winner ? game.winner : 'Everybody'
  if (game.type === 'mafia') {
    if (winningTeam == 'The Mafia')
      await game.messagePlayers(
        'The final innocent townsperson has been killed. The mafia have successfully taken over the city.'
      )
    else if (winningTeam == 'The Town')
      await game.messagePlayers(
        'The final mafia member has been killed. The townspeople can finally live in peace. For now...'
      )
  }

  await game.messagePlayers(
    `Quality game, ${game.guild.name}. **${winningTeam} wins!**`
  )

  if (game.type === 'mafia') {
    game.setPermissions('end')

    await Promise.all(
      Array.from(game.players).map(player => {
        console.log('unmuting', player.tag)
        return game.guild.member(player).edit({ mute: false })
      })
    ).catch(() => {
      console.log('failed')
    })
  }
  getGeneralTextChannel(game.guild).send(
    '(To delete the roles and channels the bot made for this game, use ?cleanup)'
  )
  console.log('Game end.\n---')
}
