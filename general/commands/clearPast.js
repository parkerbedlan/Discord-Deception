// debugging
// When you change the code in the middle of a game, the bot doesn't get to do cleanup
// This does the cleanUp for you instead of having to manually delete every channel and role.

// todo: for production, put this right before a game starts in case cleanup never happened

module.exports = async msg => {
    if (!msg.guild)
        return msg.reply('Dude ??clear is for channels only')

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
    
    const playersRole = msg.guild.roles.cache.find(r => r.name == 'Players' && r.color == 9215743)
    if (playersRole)
    {
        playersRole.edit({color: 'DEFAULT'}).catch(()=>{})
        playersRole.delete().catch(()=>{})
    }
    else
    {
        // console.log(msg.guild.roles.cache)
    }

    const deadRole = msg.guild.roles.cache.find(r => r.name == 'Dead' && r.color == 11024946)
    if (deadRole)
    {
        deadRole.edit({color: 'DEFAULT'}).catch(()=>{})
        deadRole.delete().catch(()=>{})
    }

    const categoryChannel = msg.guild.channels.cache.find(ch => ch.name == 'Mafia Game')
    // console.log(msg.guild.channels.cache)
    if (categoryChannel)
    {
        msg.guild.channels.cache.filter(ch => ch.parent == categoryChannel).forEach(ch => ch.delete())
        categoryChannel.delete()
    }

    console.log('The past never happened.')
}