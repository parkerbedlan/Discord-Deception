const {getPlayingServers} = require('../bot.js');

//this is the mafia1 branch, I guess
module.exports = async msg => {
    // prevent several game instances until setup is complete (but even then, 1 player can't be in several games)
        // for now, just only allow one instance
        // (otherwise there are also problems with the ?ready command and which host said it)
        // also, if several instances were allowed, one user can't host several games
    if (getPlayingServers()[msg.guild])
    {
        return msg.reply('Sorry, a discord deception game is already happening in this server. You\'ll have to wait for the current one to finish before starting a new one.')
    }
    else
    {
        getPlayingServers()[msg.guild] = {type: 'mafia', host: msg.author, playerCount: 1}
    }

    // todo: make the message big, beautiful, and noticable with MessageEmbed (like w the help command)
    // todo: gather players for set-up using msg.createReactionCollecter
    const signupMessage = await msg.channel.send('Raise your hand if you wanna play a game of mafia!')
    signupMessage.react('✋')
    msg.reply('You\'re the host. Use ?ready when everyone has joined. If you change your mind, use ?cancel')

    // the bot's hand is a stand-in for the host (bc whether he likes it is optional), so unreact if they react and vice versa
    // update the playerCount for each hand raise/lower event from all players who aren't the host
    // lock the ability to react when the maximum amount of players has been hit

    // idea: for setup of custom rules, maybe DM the host instructions
    // idea: in those DMs, maybe give the host the ability to ?kick people they don't want to play that raised their hand
    // idea: and also the ability to ?invite people to play, where the bot DMs the invited person the link to the hand raising message
}

