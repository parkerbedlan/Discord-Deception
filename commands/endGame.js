const { runningGames } = require("../bot")

module.exports = msg => {
    const game = runningGames[msg.guild]

    // filler ending
    const winningTeam = 'everybody'
    msg.channel.send(`quality game, ${game.guild.name}. ${winningTeam} wins!`)

    // clean up
    game.players.forEach(async player => {
        // console.log(`deleting DMs of ${player.username}...`)
        player.dmChannel.messages.fetch()
            .then(messages => {
                messages.forEach(message => message.delete().catch(() => {}))
            })
            .catch(console.error)
    })
    game.playersRole.edit({color: 'DEFAULT'})
    game.playersRole.delete()
    game.categoryChannel.delete()
    delete runningGames[msg.guild]
    console.log('Game end.')
}