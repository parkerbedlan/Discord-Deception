// todo: this setup program can probably be generalized like readyCommand.js was

const {runningGames, Game, signUpMessage} = require('../bot.js');
const maxPlayers = 30

//this is the mafia1 branch, I guess
module.exports = async (client, msg) => {
    // prevent several game instances until setup is complete (but even then, 1 player can't be in several games)
        // for now, just only allow one instance
        // (otherwise there are also problems with the ?ready command and which host said it)
        // also, if several instances were allowed, one user can't host several games
    if (runningGames[msg.guild])
    {
        return msg.reply('Sorry, a discord deception game is already happening in this server. You\'ll have to wait for the current one to finish before starting a new one.')
    }
    else
    {
        runningGames[msg.guild] = new Game('mafia', msg.author, 0, msg.guild)
    }
    const game = runningGames[msg.guild]

    // todo: gather players for set-up using msg.createReactionCollector
    const sUmsg = await msg.channel.send(signUpMessage(game))
    msg.reply('You\'re the host. Use ?ready when everyone has joined. If you change your mind, use ?cancel')
    
    // todo: the reaction collector is only triggered once then quits!!!
    // idea: add a timer? (.resetTimer https://discord.js.org/#/docs/main/stable/class/ReactionCollector?scrollTo=resetTimer)
    const filter = (reaction, user) => {
        console.log('filter '+(reaction.emoji.name === '✋' && game.players.size != reaction.users.cache.array().length))
        return reaction.emoji.name === '✋' && game.players.size != reaction.users.cache.array().length
    }
    function collect(r,u)
    {
        // todo: if host, unreact
        console.log(`${u.username} raised their hand`)
        game.players.add(u)
        game.playerCount += 1
        sUmsg.edit(undefined, signUpMessage(game))
        // sUmsg.createReactionCollector(filter, {max: maxPlayers, maxEmojis: 1, maxUsers: maxPlayers})
    }
    function dispose(r,u)
    {
        // todo: if host, react
        console.log(`${u.username} lowered their hand`)
        game.players.delete(u)
        game.playerCount -= 1
        sUmsg.edit(undefined, signUpMessage(game))
    }
    function unreact(message, emojiStr)
    {
        for ([k,v] of message.reactions.cache)
        {
            if (k === emojiStr && v.me)
            {
                dispose(v,client.user)
                v.users.remove(client.user)
            }
        }
    }
    const collector = sUmsg.createReactionCollector(filter, {maxEmojis: 1})//, {max: maxPlayers, maxEmojis: 1, maxUsers: maxPlayers})
    collector.on('collect', (r,u) => collect(r,u))
    collector.on('dispose', (r,u) => dispose(r,u))

    // await sUmsg.react('✋')
    // await unreact(sUmsg, '✋')

    

    // the bot's hand is a stand-in for the host (bc whether he likes it is optional), so unreact if they react and vice versa
    // update the playerCount for each hand raise/lower event from all players who aren't the host
    // lock the ability to react when the maximum amount of players has been hit

    // idea: for setup of custom rules, maybe DM the host instructions
    // idea: in those DMs, maybe give the host the ability to ?kick people they don't want to play that raised their hand
    // idea: and also the ability to ?invite people to play, where the bot DMs the invited person the link to the hand raising message
}

