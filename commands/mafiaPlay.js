const {getPlayingServers} = require('../bot.js')

module.exports = msg => {
    msg.channel.send("Setting up a good ol game of mafia, a true classic banger...")
    // ... 
    msg.channel.send('wow this game is super intense, so many cool things are happening')
    const winningTeam = 'everybody'
    msg.channel.send(`gg good job ${winningTeam} wins!`)
    delete getPlayingServers()[msg.guild]
}

