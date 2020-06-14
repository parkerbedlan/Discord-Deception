// mafia-specific
const {botchats, runningGames} = require('../bot.js')
const startMorning = require('./startMorning')
module.exports = msg => {
    if(!botchats.has(msg.author)) return
    const game = Object.values(runningGames).find(g => g.players.has(msg.author))
    if(!game.jobSets.cop.has(msg.author) || game.dead.has(msg.author)) return 'only cops can use ?inspect'

    const bcusers = botchats.get(msg.author)
    const suspectUsername = msg.cleanContent.replace(/[?]inspect/g,'').trim()
    const suspectUser = Array.from(game.alive).find(u => u.username == suspectUsername)

    if (!suspectUser)
    {
        bcusers.forEach(user => {
            user.send(`command failed: "${victimUsername}" is not a username of a remaining player.`)
        })
        return
    }
    else
    {
        bcusers.forEach(user => {
            user.send(`**${suspectUsername}**'s secret identity is: ***${game.playerToJob.get(suspectUser)}***. Return to <#${game.generalTextChannel.id}>`)
            botchats.delete(user)
        })
        startMorning(game)
    }
}