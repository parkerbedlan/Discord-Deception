// When you change the code in the middle of a game, the bot doesn't get to do cleanup in endGame
// This does the cleanUp for you instead of having to manually delete every channel and role.

// todo: for production, put this right before a game starts in case endGame failed to do so

module.exports = msg => {
    if (!msg.guild)
        return msg.reply('Dude this is for channels only')

    msg.guild.members.fetch()
        .then(members => {
            members.forEach(member => {
                if (!member.user.dmChannel) return
                member.user.dmChannel.messages.fetch()
                    .then(messages => {
                        messages.forEach(message => message.delete().catch(() => {}))
                    })
                    .catch(console.error)
            })
        })
        .catch(console.error)
    
    const playersRole = msg.guild.roles.cache.find(r => r.name == 'Players' && r.color == '#8c9eff')
    if (playersRole)
    {
        playersRole.edit({color: 'DEFAULT'})
        playersRole.delete()
    }
    const categoryChannel = msg.guild.channels.cache.find(ch => ch.name == 'Mafia Game')
    msg.guild.channels.cache.filter(ch => ch.parent == categoryChannel).forEach(ch => ch.delete())
    categoryChannel.delete()

    console.log('The past never happened.')
}