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
        runningGames[msg.guild] = new Game('mafia', msg.author, msg.guild)
    }
    const game = runningGames[msg.guild]

    // todo: gather players for set-up using msg.createReactionCollector
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
        await console.log(`${u.username} raised their hand`)
        await game.players.add(u)
        // todo: if host, unreact
        if (u.equals(game.host))
        {
            unreact(sUmsg, '✋')
        }
        await sUmsg.edit(undefined, signUpMessage(game))
        // sUmsg.createReactionCollector(filter, {max: maxPlayers, maxEmojis: 1, maxUsers: maxPlayers})
    }
    async function remove(r,u)
    {
        if(!game.players.has(u)) return
        await console.log(`${u.username} lowered their hand`)
        await game.players.delete(u)
        // todo: if host, react
        if (u.equals(game.host))
        {
            sUmsg.react('✋')
        }
        await sUmsg.edit(undefined, signUpMessage(game))
    }
    async function unreact(message, emojiStr)
    {
        for ([k,v] of message.reactions.cache)
        {
            if (k === emojiStr && v.me)
            {
                // remove(v,client.user)
                await v.users.remove(client.user)
            }
        }
    }
    const collector = sUmsg.createReactionCollector(filter, {dispose: true})//, {max: maxPlayers, maxEmojis: 1, maxUsers: maxPlayers})
    collector.on('remove', (r,u) => remove(r,u));
    collector.on('collect', (r,u) => collect(r,u));

    await sUmsg.react('✋')
    console.log(game.host.username)

    // the bot's hand is a stand-in for the host (bc whether he likes it is optional), so unreact if they react and vice versa
    // update game.players for each hand raise/lower event from all players who aren't the host
    // lock the ability to react when the maximum amount of players has been hit

    // idea: for setup of custom rules, maybe DM the host instructions
    // idea: in those DMs, maybe give the host the ability to ?kick people they don't want to play that raised their hand
    // idea: and also the ability to ?invite people to play, where the bot DMs the invited person the link to the hand raising message
}

