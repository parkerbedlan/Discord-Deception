// mafia-specific
const root = require.main
const {runningGames} = root.require('./bot.js')

module.exports = msg => {
    const game = Object.values(runningGames).find(g => g.alive.has(msg.author))
    if(!game || game.status != 'voting')
        return msg.reply("It's not time to vote right now.")

    const voteSearch = msg.content.match(/^[?]vote\s*(a|b|c)\b/)
    if (!voteSearch || !game.suspects.has(voteSearch[1].toLowerCase()))
        return msg.reply(`You've got to include the letter of the suspect you're voting for, like "?vote z". The list of possible suspects is above.`)
    else if (game.votes.has(msg.author))
        return msg.reply(`You can only vote once, and you've already voted for ${games.votes.get(msg.author)}`)
    else
    {
        // console.log(game.suspects)
        
        const voted = game.suspects.get(voteSearch[1].toLowerCase())
        game.votes.set(msg.author, voted)
        if (!game.voteTally.has(voted))
            game.voteTally.set(voted, new Set([msg.author]))
        else
            game.voteTally.set(voted, game.voteTally.get(voted).add(msg.author))
        msg.reply(`You've voted for ${voted.username}`)
    }

    if(game.votes.size == game.alive.size)
    {
        game.emit('startHanging')
    }
}