// mafia-specific
const {Permissions, MessageEmbed} = require('discord.js')
const createBotchat = require.main.require('./general/resources/createBotchat')

module.exports = {
    execute: async game => {
        console.log('night')

        // clean up previous morning messages
        if (game.voteMsg)
        {
            await game.allPlayersMsg.delete()
            await game.accuseMsg.delete()
            await game.suspectsMsg.delete()
            await game.voteMsg.delete()
        }

        // restrict permissions
        game.muted = true
        game.generalVoiceChannel.delete()
        game.generalTextChannel.overwritePermissions([
            {
                id: game.guild.roles.cache.find(r => r.name == '@everyone'),
                type: 'role',
                deny: new Permissions(2147483647)
            },
            {
                id: game.playersRole,
                type: 'role',
                deny: new Permissions(2143878079)   // no messaging
            },
            {
                id: game.deadRole,
                type: 'role',
                allow: new Permissions(1049600),
                deny: new Permissions(2146434047)
            }
        ])

        game.generalTextChannel.send('The Night has fallen, and the Townspeople go to sleep...')

        game.remainingPlayers = ''
        game.alive.forEach(user => game.remainingPlayers += user.username + '\n')

        game.emit('mafiaNight')
    },

    mafiaNight,
    copNight
}

function mafiaNight(game)
{
    if (!game.firstNight) // not the first night
    {
        // todo: assign each player a number at beginning of game, show in order but exclude dead ones
        // todo: show a bottom of chat timer - if they can't come to a consensus in the given time, they don't get to kill anyone
        // mafia kill
        game.generalTextChannel.send('The mafia are selecting their next victim...')

        let mafiaBC, mafiaBCstr;
        [mafiaBC, mafiaBCstr] = createBotchat(game.jobSets.mafia)

        mafiaBC.forEach(user => {
            if (mafiaBC.size > 1)
                user.send('This is a chat where the mafia can speak freely and must decide who to kill. These are the remaining mafia:\n' + mafiaBCstr)
            user.send(new MessageEmbed()
                .setColor('#8c9eff')
                .setTitle(`The first use of "?kill **victim_username_here**" will kill them, so ${mafiaBC.size == 1 ? 'think' : 'discuss'} carefully before using it!`)
                .setDescription(`${game.remainingPlayers}`)
            )
        })
    }
    else if(game.jobSets.mafia.size > 1) // more than 1 mafia and the first night
    {
        game.generalTextChannel.send('The mafia are finding out who their partners are...')
        let mafiaStr = ''
        game.jobSets.mafia.forEach(user => mafiaStr += user.username + '\n')
        game.jobSets.mafia.forEach(user => user.send('These are your partners in crime:\n'+ mafiaStr))
        game.emit('copNight')
    }
    else // only 1 mafia and the first night
    {
        game.emit('copNight')
    }
}

function copNight(game)
{
    // todo: alternate rule - cop spooned a random unknown living mafia identity like in the org.ntnu.no/mafia rules
    if (game.jobSets.cop.size)
    {
        game.generalTextChannel.send(`The cop${game.jobSets.cop.size == 1 ? ' is' : 's are'} invtestigating a suspect...`)
        let copBC, copBCstr;
        [copBC, copBCstr] = createBotchat(game.jobSets.cop)

        copBC.forEach(user => {
            if(copBC.size > 1)
                user.send('This is a chat where the cops can speak freely and must decide who to kill. These are the remaining cops:\n'+mafiaBCstr)
            user.send(new MessageEmbed()
                .setColor('#8c9eff')
                .setTitle(`The first use of "?inspect **suspect_username_here**" will reveal their identity to ${mafiaBC.size == 1 ? 'you, so think' : 'all the cops, so discuss'} carefully before using it!`)
                .setDescription(`${game.remainingPlayers}`)
            )
        })
    }
    else
    {
        game.emit('startMorning')
    }
}