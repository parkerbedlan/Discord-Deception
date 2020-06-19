// mafia-specific (todo: make it generalized)

// todo: on the first night, mafia only get to learn each others' identities; they don't get to kill
// todo: make it less honor systemy
// todo: make list of all Game properties (some documentation), separating universal Game properties and Mafia Game properties

const {Permissions, MessageEmbed} = require('discord.js')
const root = require.main
const {runningGames, shuffleArray, botchats} = root.require('./bot.js')
const {execute:startNight, mafiaNight, copNight} = root.require('./mafia/stages/startNight')
const {execute:startMorning, startAccusing, startVoting, startHanging} = root.require('./mafia/stages/startMorning')
const endGame = root.require('./mafia/stages/endGame')

const shortToFull = {
    m: 'mafia',
    i: 'innocent',
    c: 'cop'
}

module.exports = async msg => {
    msg.channel.send("Let's play some Mafia! Sending out your secret roles...")

    const game = await runningGames[msg.guild]
    if (game.status == 'playing')
        return
    game.status = 'playing'
    game.players.delete(msg.client.user)
    game.players.add(game.host)
    console.log(`Starting ${game.type} game with ${game.players.size} player${game.players.size > 1 ? 's' : ''}`)

    game.numToPlayer = new Map()
    let i = 1
    game.players.forEach(player => game.numToPlayer.set(i++, player))
    for ([k,v] of game.numToPlayer)
    {
        console.log(`${k}: ${v.username}`)
    }

    game.playersRole = await game.guild.roles.create({
        data: {
            name: 'Players',
            hoist: true,
            position: 1,
            mentionable: true,
            color: '#8c9eff'
        }
    })

    game.deadRole = await game.guild.roles.create({
        data: {
            name: 'Dead',
            hoist: true,
            position: 2,
            mentionable: false,
            color: '#a83a32'
        }
    })

    game.jobSets = {
        mafia: new Set(),
        innocent: new Set(),
        cop: new Set()
    }
    game.playerToJob = new Map()
    game.playerToDeadJob = new Map()
    game.dead = new Set()
    game.alive = new Set()
    game.players.forEach(player => {
        game.alive.add(player)
    })

    let jobHat = []
    for (j = 0; j < Math.ceil(game.players.size * .226); j++)
        jobHat.push('m')
    if (game.players.size > 6)
        for (i = 0; i < Math.ceil(game.players.size * .051); i++)
            jobHat.push('c')
    while (jobHat.length < game.players.size)
        jobHat.push('i')

    jobHat = shuffleArray(jobHat)
    console.log(jobHat)
    // todo: number players too
    game.players.forEach(async player => {
        // give public 'Players' role
        const member = await game.guild.member(player)
        member.roles.add(game.playersRole)
        // pull their secret job from a hat
        const job = shortToFull[jobHat.pop()]
        console.log(`${player.username}: ${job}`)
        game.playerToJob.set(player, job)
        game.jobSets[job].add(player)
        // console.log(`DMing ${player.username}...`)
        player.send(`Your secret role is: ||**${job}**||. Shhh, don't tell anyone...`)
        // console.log(`just DMed ${player.username}`)
    })

    game.categoryChannel = await game.guild.channels.create('Mafia Game', {
        type: 'category',
        position: 1,
        permissionOverwrites: [
            {
                id: game.guild.roles.cache.find(r => r.name == '@everyone'),
                type: 'role',
                deny: new Permissions(2147483647)
            },
            {
                id: game.playersRole,
                type: 'role',
                allow: new Permissions(3607616),
                deny: new Permissions(2143876031)
            },
            {
                id: game.deadRole,
                type: 'role',
                allow: new Permissions(1049600),
                deny: new Permissions(2146434047)
            }
        ]
    })

    game.generalVoiceChannel = await game.guild.channels.create('Town Hall', {
        parent: game.categoryChannel,
        type: 'voice',
        userLimit: game.players.size
    })

    game.generalTextChannel = await game.guild.channels.create('public-record', {
        parent: game.categoryChannel,
        type: 'text'
    })

    const jobConfirmationMsg = await game.generalTextChannel.send(
        new MessageEmbed()
            .setColor('#8c9eff')
            .setThumbnail("https://i.imgur.com/IchybTu.png")
            .setTitle(`Raise your hand once you've seen your secret role!`)
            .addField(`Night will start when everyone has raised their hand.`, `Feel free to hang out in Town Hall until Night starts.`)
    )
    jobConfirmationMsg.react('✋')
    game.players.forEach(player => player.send(`Make sure to go to the comment in <#${game.generalTextChannel.id}> and raise your hand so Night can start!`))
    let readyPlayers = new Set()
    const filter = (reaction) => {return reaction.emoji.name === '✋'}
    const collector = jobConfirmationMsg.createReactionCollector(filter)
    collector.on('collect', (reaction, user) => {
        readyPlayers.add(user)
        if (readyPlayers.size == game.players.size + 1)
        {
            collector.stop()
            jobConfirmationMsg.delete()
                .then(() => {
                    game.on('startNight', () => {startNight(game)})
                    game.on('mafiaNight', () => {mafiaNight(game)})
                    game.on('copNight', () => {copNight(game)})
                    game.on('startMorning', () => {startMorning(game)})
                    game.on('startAccusing', () => {startAccusing(game)})
                    game.on('startVoting', () => {startVoting(game)})
                    game.on('startHanging', () => {startHanging(game)})
                    game.on('endGame', () => {endGame(game)})

                    game.emit('startNight')
                })
        }
            
    })
}