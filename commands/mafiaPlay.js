const {runningGames, shuffleArray} = require('../bot.js')
const {Permissions} = require('discord.js')

const jobRatios = {
    1: ['m'],
    2: ['m','i']
}
const shortToFull = {
    m: 'mafia',
    i: 'innocent',
    c: 'cop'
    // d: 'doctor
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

    game.playersRole = await game.guild.roles.create({
        data: {
            name: 'Players',
            hoist: true,
            position: 1,
            mentionable: true,
            color: '#8c9eff'
        }
    })

    let jobSets = {
        mafia: new Set(),
        innocent: new Set(),
        cop: new Set()
    }
    let userToJob = new Map()
    let jobHat = shuffleArray(jobRatios[game.players.size])
    console.log(jobHat)
    game.players.forEach(async player => {
        // give public 'Players' role
        const member = await game.guild.member(player)
        member.roles.add(game.playersRole)
        // pull their secret job from a hat
        const job = shortToFull[jobHat.pop()]
        console.log(`${player.username}: ${job}`)
        userToJob.set(player, job)
        jobSets[job].add(player)
        // console.log(`DMing ${player.username}...`)
        player.send(`Your secret role is: **${job}**. Shhh, don't tell anyone...`)
        // console.log(`just DMed ${player.username}`)
    })

    game.categoryChannel = await game.guild.channels.create('Mafia Game', {
        type: 'category',
        position: 1,
        permissionOverwrites: [
            {
                id: game.playersRole,
                type: 'role',
                allow: new Permissions(3607616),
                deny: new Permissions(2143876031)
            }
        ]
    })

}