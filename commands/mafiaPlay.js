const {runningGames, shuffleArray} = require('../bot.js')

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
    const game = runningGames[msg.guild]
    game.status = 'playing'
    game.players.delete(msg.client.user)
    game.players.add(game.host)
    console.log(`${game.players.size} player${game.players.size > 1 ? 's' : ''}`)

    const playersRole = await game.guild.roles.create({
        data: {
            name: 'Players',
            hoist: true,
            position: 1,
            mentionable: true,
            color: '#8c9eff'
        },
        reason: `For a game of ${game.type}`
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
        member.roles.add(playersRole)
        // pull their secret job from a hat
        const job = shortToFull[jobHat.pop()]
        console.log(`${player.username}: ${job}`)
        userToJob.set(player, job)
        jobSets[job].add(player)
        console.log(`DMing ${player.username}...`)
        player.send(`Your secret role is: ${job}! Don't tell anyone...2`)
        console.log(`just DMed ${player.username}`)
    })

    // waits 5 seconds before cleaning up to simulate the game happening
    setTimeout(() => {
        const winningTeam = 'everybody'
        msg.channel.send(`quality game, ${game.guild.name}. ${winningTeam} wins!`)

        // clean up
        // todo: actually delete DMs
        game.players.forEach(async player => {
            console.log(`deleting DMs of ${player.username}...`)
            player.dmChannel.messages.fetch()
                .then(messages => {
                    // todo: fix this so an error isn't thrown everytime
                    messages.forEach(message => message.delete().catch(console.error))
                })
                .catch(console.error)
        })
        playersRole.edit({color: 'DEFAULT'})
        playersRole.delete('The game finished.')
        delete runningGames[msg.guild]
    }, 5000)

}