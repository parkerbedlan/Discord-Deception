const { MessageEmbed } = require('discord.js')

// mafia-specific
const root = require.main
const { runningGames } = root.require('./bot.js')

module.exports = msg => {
  const game = Object.values(runningGames).find(g => g.alive.has(msg.author))
  if (!game || game.status != 'accusing')
    return msg.reply("It's not time to accuse people right now.")

  const numSearch = msg.content.match(/(\d+)/)
  if (!numSearch)
    return msg.reply(
      `You've got to include the number of the player you're accusing, like \"?accuse 0\"`
    )
  else if (game.votes.has(msg.author)) {
    return msg.reply(
      `You can only accuse one player right now, and you've already accused ${game.votes.get(
        msg.author
      )}!`
    )
  } else if (
    !game.numToPlayer.has(
      Number(numSearch[1]) ||
        !game.alive.has(game.numToPlayer.get(Number(numSearch[1])))
    )
  ) {
    msg.reply(
      `That's not the number of a player in this game. Here's the list of alive players who you can vote for: `
    )
    msg
      .reply(game.allPlayersMsgEmbed)
      .then(message => game.allPlayersMsgs.push(message))
  } else {
    const accused = game.numToPlayer.get(Number(numSearch[1]))
    game.votes.set(msg.author, accused)
    if (!game.voteTally.has(accused))
      game.voteTally.set(accused, new Set([msg.author]))
    else
      game.voteTally.set(accused, game.voteTally.get(accused).add(msg.author))
    msg.reply(`You've accused ${accused.username}.`)
    game.allPlayersMsgs.forEach(message => {
      const accuserNum = game.playerToNum.get(msg.author)
      const updatedPlayersString = message.embeds[0].fields[1].value
        .split('\n')
        .map(str => {
          if (str.includes('' + accuserNum + ':')) return str + '✅'
          return str
        })
        .join('\n')
      const updatedMsgEmbed = new MessageEmbed()
        .setColor('#8c9eff')
        .addFields(message.embeds[0].fields[0], {
          name: 'Alive',
          value: updatedPlayersString,
        })
      message.edit(updatedMsgEmbed)
    })
  }

  if (game.votes.size == game.alive.size) {
    game.revote = false
    game.emit('startVoting')
  }
}
