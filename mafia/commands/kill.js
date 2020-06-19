// mafia-specific
const root = require.main
const {botchats, runningGames} = root.require('./bot.js')
module.exports = msg => {
    if(!botchats.has(msg.author)) return
    const game = Object.values(runningGames).find(g => g.players.has(msg.author))
    if(!game.jobSets.mafia.has(msg.author) || game.dead.has(msg.author)) return 'only mafia can use ?kill'

    const bcusers = botchats.get(msg.author)
    const victimUsername = msg.cleanContent.replace(/[?]kill/g,'').trim()
    const victimUser = Array.from(game.alive).find(u => u.username == victimUsername)
    
    if(!victimUser)
    {
        bcusers.forEach(user => {
            user.send(`command failed: "${victimUsername}" is not a username of a remaining player.`)
        })
        return
    }
    else
    {
        bcusers.forEach(user => {
            user.send(`command complete: **${victimUsername}** to be eliminated. Return to <#${game.generalTextChannel.id}>`)
            botchats.delete(user)  
        })
        game.nightKill = victimUser
        game.emit('copNight')
    }
}