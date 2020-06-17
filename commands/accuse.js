// mafia-specific
const {runningGames} = require('../bot.js')
const {startVoting} = require('./startMorning')

module.exports = msg => {
    const game = Object.values(runningGames).find(g => g.alive.has(msg.author))
    if(!game || game.status != 'accusing')
        return msg.reply("It's not time to accuse people right now.")
    
    const numSearch = msg.content.match(/(\d+)/)
    if(!numSearch)  
        return msg.reply(`You've got to include the number of the player you're accusing, like \"?accuse 0\"\nYou can find the list of player numbers pinned in <#${game.generalTextChannel.id}>`)
    else if (game.votes.has(msg.author))
    {
        return msg.reply(`You can only accuse one player right now, and you've already accused ${game.votes.get(msg.author)}!`)
    }
    else if (!game.numToPlayer.has(Number(numSearch[1]) || !game.alive.has(game.numToPlayer.get(Number(numSearch[1])))))
    {
        msg.reply(`That's not the number of a player in this game. Here's the list of alive players who you can vote for: `)
        return msg.reply(game.allPlayersMsgEmbed)
    }
    else
    {
        const accused = game.numToPlayer.get(Number(numSearch[1]))
        game.votes.set(msg.author, accused)
        if (!game.voteTally.has(accused))
            game.voteTally.set(accused, new Set([msg.author]))
        else
            game.voteTally.set(accused, game.voteTally.get(accused).add(msg.author))
        msg.reply(`You've accused ${accused.username}.`)
    }

    if (game.votes.size == game.alive.size)
    {
        game.revote = false
        startVoting(game)
    }
}
