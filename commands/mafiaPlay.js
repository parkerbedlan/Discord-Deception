const {runningGames} = require('../bot.js')

module.exports = msg => {
    const game = runningGames[msg.guild]
    msg.channel.send("Setting up a good ol game of mafia, a true classic banger...")
    // ... 
    msg.channel.send('wow this game is super intense, so many cool things are happening')
    const winningTeam = 'everybody'
    msg.channel.send(`quality game, ${game.guild.name}. ${winningTeam} wins!`)
    delete runningGames[msg.guild]
}