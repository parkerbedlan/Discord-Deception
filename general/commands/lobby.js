// mafia-specific (todo: needs to be generalized!)

// todo: rename lobby.js
// todo: make emojis based on a function (convert kevin's job generator into a bot.js function that can work with it)
// todo: make a new version of the lobby message that basically copies UnoBot
    // important part: list players on message! this eliminates need for bot unliking when host likes (massive headache)
// todo: this setup program can probably be generalized like readyCommand.js was
// todo: implement autostart argument

const root = require.main
const Game = root.require('./general/resources/game')
const {runningGames, generateLobbyMessage, maxPlayers, unreact} = root.require('./bot.js')
const readyCommand = root.require('./general/commands/readyCommand')
const cancel = root.require('./general/commands/cancel')
const clearPast = root.require('./general/commands/clearPast')

//this is the mafia1 branch, I guess
module.exports = async (msg, type) => {
    // console.log(runningGames)
    if (!msg.guild)
    {
        return msg.reply("While a single player deception game would be really easy, it's best played in a server where there are, yunno, people you can play with.")
    }
    // prevent several game instances until setup is complete (but even then, 1 player can't be in several games)
        // for now, just only allow one instance
        // (otherwise there are also problems with the ?ready command and which host said it)
        // also, if several instances were allowed, one user can't host several games
    if (runningGames[msg.guild])
    {
        return msg.reply('Sorry, a discord deception game is already happening in this server. You\'ll have to wait for the current one to finish before starting a new one.')
    }

    clearPast(msg)
    runningGames[msg.guild] = new Game('mafia', msg.author, msg.guild)
    const game = runningGames[msg.guild]

    // gather players
    const sUmsg = await msg.channel.send(generateLobbyMessage(game))
    game.lobbyMsg = sUmsg
    msg.reply('You\'re the host. Use ?ready when everyone has joined. If you change your mind, use ?cancel')
    
    // idea: add a timer? (.resetTimer https://discord.js.org/#/docs/main/stable/class/ReactionCollector?scrollTo=resetTimer)
    const filter = (reaction) => {return reaction.emoji.name === '✋'}
    const collector = sUmsg.createReactionCollector(filter, {dispose: true})
    collector.on('collect', async (r,u) => {
        if(game.players.has(u)) return

        await game.players.add(u)

        if (u.equals(game.host))
            await unreact(sUmsg, '✋');
        await sUmsg.edit(undefined, generateLobbyMessage(game))
        
        if (game.players.size == maxPlayers.mafia)
        {
            collector.stop('max players reached')
                .then(readyCommand(msg))
                .catch(() => {
                    msg.reply('Quit spamming the like button, bub.')
                    cancel(msg)
                })
        }
    });
    collector.on('remove', async (r,u) => {
        if(!game.players.has(u)) return

        await game.players.delete(u)

        if (u.equals(game.host))
        {
            await sUmsg.react('✋')
        }
        
        await sUmsg.edit(undefined, generateLobbyMessage(game))
    });

    await sUmsg.react('✋')

    // lock the ability to react when the maximum amount of players has been hit

    // idea: for setup of custom rules, maybe DM the host instructions
    // idea: in those DMs, maybe give the host the ability to ?kick people they don't want to play that raised their hand
    // idea: and also the ability to ?invite people to play, where the bot DMs the invited person the link to the hand raising message
}

