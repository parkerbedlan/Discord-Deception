// mafia-specific
const {Permissions, MessageEmbed} = require('discord.js')
const endGame = require('./endGame')
const kill = require('./kill')
module.exports = async game => {
    console.log('morning')

    // undo night permissions
    game.muted = false
    game.generalVoiceChannel = await game.generalVoiceChannel.clone().catch(()=>{})
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

    // announce night kill and check for winner
    game.generalTextChannel.send(`The morning has come, and it's a beautiful day outside. Birds are singing, flowers are blooming...`)
    if(game.nightKill)
    {
        game.generalTextChannel.send(`and ${game.nightKill} is dead.`)
        game.alive.delete(game.nightKill)
        game.dead.add(game.nightKill)
        game.guild.member(game.nightKill).roles.remove(game.playersRole)
        game.playerToDeadJob.set(player, 'unknown')
        game.nightKill = null

        if (winnerCheck(game))
        {
            console.log('winner winner chicken dinner: ' + game.winner)
            endGame(game)
            return
        }
        else
            console.log('no winner yet')
    }
    else
    {
        // game.generalTextChannel.send("and the Mafia were too busy playing poker with the family to kill anyone last night.")
    }

    // trial
    game.generalTextChannel.send("Anyways, time to hang someone!")
   
    let aliveStr = ''
    let deadStr = ''
    for ([num, player] of game.numToPlayer)
    {
        let paddedNum = ' '+num
        paddedNum = paddedNum.substring(paddedNum.length-2)
        if (game.alive.has(player))
            aliveStr += `${paddedNum}: ${player.username}`
        else if (game.dead.has(player))
            deadStr += `${player.username} (${game.playerToDeadJob.get(player)})`
        else
            console.log(player + ' is neither dead nor alive??')
    }
    if (!deadStr) deadStr = 'None... yet :smiling_imp:'

    game.allPlayersMsgEmbed = new MessageEmbed()
        .setColor('#8c9eff')
        .addFields({name: 'Dead', value: deadStr}, {name: 'Alive', value: aliveStr})
    game.allPlayersMsg = await game.generalTextChannel.send(game.allPlayersMsgEmbed)
    game.allPlayersMsg.pin().catch(console.error)
    
    // todo: wait some time to force discussion before allowing ?nominate or ?vote
    
    game.allPlayersMsg.unpin().catch(console.error)
        .then(async () => {game.allPlayersMsg.delete()
            .then(async () => {
                game.allPlayersMsg = await game.generalTextChannel.send(game.allPlayersMsgEmbed)
                game.allPlayersMsg.pin().catch(console.error)
                game.generalTextChannel.send("You can now DM me an accusation using ?accuse and their number above. Everyone must submit an accusation before we move onto voting.")
            }).catch(console.error)
        }).catch(console.error)
    game.votes = new Map()
    game.status = 'accusing'
     // idea: x accusations left
    game.alive.forEach(player => player.send(`Once you've decided who to accuse, privately send me \"?accuse 0\" (replace 0 with their number)\nFeel free to discuss in <#${game.generalTextChannel.id}> until you're ready.`))

    // todo: voting on top 2 or 3 suspects
    // game.votes = new Map()
    // game.status = 'playing
    // game.status = 'voting'

    // todo: delete game.allPlayersMsg and game.suspectsMsg after the trial
}

function winnerCheck(game)
{
    console.log('checking for winner')
    let mafiaAllDead = true
    for (const player of game.jobSets.mafia)
    {
        if (game.alive.has(player))
        {
            mafiaAllDead = false
            break
        }
    }
    if (mafiaAllDead)
    {
        game.winner = "The Town"
        return true
    }

    let innoAllDead = true
    for (const player of game.jobSets.innocent)
    {
        if (game.alive.has(player))
        {
            innoAllDead = false
            break
        }
    }
    if (innoAllDead)
    {
        game.winner = "The Mafia"
        return true
    }
    return false
}