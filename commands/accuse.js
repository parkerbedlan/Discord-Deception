// mafia-specific
const {runningGames} = require('../bot.js')
module.exports = msg => {
    const game = Object.values(runningGames).find(g => g.alive.has(msg.author))
    if(!game || game.status != 'accusing')
        return msg.reply("It's not time to accuse people right now.")
    
    const numSearch = msg.content.match(/(\d+)/)
    if(!numSearch)  
        return msg.reply(`You've got to include the number of the player you're accusing, like \"?accuse 0\"\nYou can find the list of player numbers pinned in <#${game.generalTextChannel.id}>`)
    else // todo: finish this
    {

    }
}
