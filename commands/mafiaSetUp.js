// todo: don't allow if started in a DM channel
// todo: this setup program can probably be generalized like readyCommand.js was
// todo: implement autostart argument
// idea: rename lobby?

const {runningGames, Game, signUpMessage, maxPlayers, unreact} = require('../bot.js');
const readyCommand = require('./readyCommand');
const cancel = require('./cancel.js');

//this is the mafia1 branch, I guess
module.exports = async (client, msg) => {
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
    else
    {
        runningGames[msg.guild] = new Game('mafia', msg.author, msg.guild)
    }
    const game = runningGames[msg.guild]

    // gather players
    const sUmsg = await msg.channel.send(signUpMessage(game))
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
        await sUmsg.edit(undefined, signUpMessage(game))
        
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
        
        await sUmsg.edit(undefined, signUpMessage(game))
    });

    await sUmsg.react('✋')

    // lock the ability to react when the maximum amount of players has been hit

    // idea: for setup of custom rules, maybe DM the host instructions
    // idea: in those DMs, maybe give the host the ability to ?kick people they don't want to play that raised their hand
    // idea: and also the ability to ?invite people to play, where the bot DMs the invited person the link to the hand raising message
}

