// generalized
// basically a stable version of clearPast
// used to be at the end of endGame, but deleting the public-record right when it finds out a team wins is too sudden

const {runningGames} = require('../bot.js')
module.exports = game => {

    // deletes any DMs it can (Discord makes deleting DMs hard)
    game.players.forEach(async player => {
        player.dmChannel.messages.fetch()
            .then(messages => {
                messages.forEach(message => message.delete().catch(() => {}))
            })
            .catch(console.error)
    })

    if (game.type == 'mafia')
    {
        game.playersRole.edit({color: 'DEFAULT'})
        game.playersRole.delete()
        game.deadRole.edit({color: 'DEFAULT'})
        game.deadRole.delete()
        game.categoryChannel.delete()
        game.generalVoiceChannel.delete().catch(()=>{})
        game.generalTextChannel.delete()
    }

    delete runningGames[game.guild]
}