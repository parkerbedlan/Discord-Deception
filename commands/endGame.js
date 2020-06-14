// generalized (requires game.generalTextChannel)

module.exports = async game => {
    game.status = 'ended'
    const winningTeam = game.winner ? game.winner : 'Everybody'
    if (game.type == 'mafia')
    {
        if (winningTeam == 'The Mafia')
        game.generalTextChannel.send("The final innocent townsperson has been killed. The mafia have successfully taken over the city.")
    else if (winningTeam == 'The Town')
        game.generalTextChannel.send("The final mafia member has been killed. The townspeople can finally live in peace. For now...")
    }
    
    game.generalTextChannel.send(`Quality game, ${game.guild.name}. **${winningTeam} wins!**`)
    game.generalTextChannel.send("(To delete the roles and channels the bot made for this game, use ?cleanup)")
    console.log('Game end.\n---')
}