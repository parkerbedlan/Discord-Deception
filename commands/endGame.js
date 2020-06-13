const { runningGames } = require("../bot")

module.exports = async msg => {
    const game = runningGames[msg.guild]

    if (!game || game.status != 'playing')
        return msg.reply("That command can only be used during a running game.")

    // filler ending
    const winningTeam = 'everybody'
    msg.channel.send(`quality game, ${game.guild.name}. ${winningTeam} wins!`)

    if (!game.playersRole) return   //??clear triggered first

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
    game.deadRole.edit({color: 'DEFAULT'})
    game.deadRole.delete()
    game.categoryChannel.delete()
    // console.log(game.generalVoiceChannel)
    game.generalVoiceChannel.delete().catch(()=>{})
    game.generalTextChannel.delete()

    if (game.type == 'mafia')
    {

    }

    delete runningGames[msg.guild]
    console.log('Game end.\n---')
}