const {Permissions, MessageEmbed} = require('discord.js')
module.exports = game => {
    console.log('morning')

    // undo night permissions
    game.muted = false
    game.generalVoiceChannel.clone().catch(()=>{})
    game.generalTextChannel.overwritePermissions([
        {
            id: game.guild.roles.cache.find(r => r.name == '@everyone'),
            type: 'role',
            deny: new Permissions(2147483647)
        },
        {
            id: game.playersRole,
            type: 'role',
            allow: new Permissions(3607616),
            deny: new Permissions(2143876031)   //back to normal
        },
        {
            id: game.deadRole,
            type: 'role',
            allow: new Permissions(1049600),
            deny: new Permissions(2146434047)
        }
    ])

    game.generalTextChannel.send(`The morning has come, and it's a beautiful day outside. Birds are singing, flowers are blooming...`)
    if(game.nightKill)
    {
        game.generalTextChannel.send(`and ${game.nightKill} is dead.`)
        game.alive.remove(game.nightKill)
        game.dead.add(game.nightKill)
        game.nightKill.roles.remove(game.playersRole)
        game.nightKill = null
    }

    // todo: if winning condition, return

    // todo: display MessageEmbed dead players list (with roles, if known)

    game.generalTextChannel.send("Anyways, time to hang someone!")
}