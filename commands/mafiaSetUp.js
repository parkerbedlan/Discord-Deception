// todo: this setup program can probably be generalized like readyCommand.js was

const {runningGames, Game, signUpMessage, maxPlayers} = require('../bot.js');
const readyCommand = require('./readyCommand')

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
        runningGames[msg.guild] = new Game('mafia', msg.author, msg.guild)
    }
    const game = runningGames[msg.guild]

    // gather players
    const sUmsg = await msg.channel.send(signUpMessage(game))
    msg.reply('You\'re the host. Use ?ready when everyone has joined. If you change your mind, use ?cancel')
    
    // idea: add a timer? (.resetTimer https://discord.js.org/#/docs/main/stable/class/ReactionCollector?scrollTo=resetTimer)
    const filter = (reaction, user) => {
        console.log('filter')
        return reaction.emoji.name === '✋'
    }
    async function collect(r,u)
    {
        if(game.players.has(u)) return
        // await console.log(`${u.username} raised their hand`)
        await game.players.add(u)
        // if host, unreact
        if (u.equals(game.host))
        {
            await unreact(sUmsg, '✋', sUmsg.edit(undefined, signUpMessage(game)))
        }
        else
        {
            sUmsg.edit(undefined, signUpMessage(game))
        }
        
        if (await game.players.size == maxPlayers.mafia)
        {
            collector.stop('max players reached')
        }
    }
    async function remove(r,u)
    {
        if(!game.players.has(u)) return
        // await console.log(`${u.username} lowered their hand`)
        await game.players.delete(u)
        // if host, react
        if (u.equals(game.host))
        {
            await sUmsg.react('✋')
        }
        
        // while (!game.players.has(game.host) && !game.players.has(client.user))
        // {
        //     await game.players
        // }
        sUmsg.edit(undefined, signUpMessage(game))
    }
    function unreact(message, emojiStr, callback)
    {
        for ([k,v] of message.reactions.cache)
        {
            if (k === emojiStr && v.me)
            {
                // remove(v,client.user)
                v.users.remove(client.user)
            }
        }
        callback()
    }
    const collector = sUmsg.createReactionCollector(filter, {dispose: true})
    collector.on('remove', (r,u) => remove(r,u));
    collector.on('collect', (r,u) => collect(r,u));
    collector.on('end', async (...args) => {
        await game.players
        readyCommand(msg)
    })

    await sUmsg.react('✋')

    // lock the ability to react when the maximum amount of players has been hit

    // idea: for setup of custom rules, maybe DM the host instructions
    // idea: in those DMs, maybe give the host the ability to ?kick people they don't want to play that raised their hand
    // idea: and also the ability to ?invite people to play, where the bot DMs the invited person the link to the hand raising message
}

