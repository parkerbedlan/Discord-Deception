//this is the mafia1 branch, I guess
module.exports = async msg => {
    // todo: check that you have admin permissions first and return error if you don't
    // gather players for set-up
    await msg.channel.send('Raise your hand if you wanna play!')
        .then(message => message.react('✋'))
        .catch(console.error)
    msg.reply('Use ?ready when everyone has joined.')
}

