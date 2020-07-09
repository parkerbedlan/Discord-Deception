// when someone sends a message that the bot can see

const root = require.main
const { runningGames, botchats, getGeneralVoiceChannel } = root.require('./bot')
const lobby = root.require('./general/commands/lobby')
const readyCommand = root.require('./general/commands/readyCommand')
const cancel = root.require('./general/commands/cancel')
const help = root.require('./general/commands/help')

const kill = root.require('./mafia/commands/kill')
const inspect = root.require('./mafia/commands/inspect')
const accuse = root.require('./mafia/commands/accuse')
const vote = root.require('./mafia/commands/vote')

const end = root.require('./mafia/stages/endGame')
const clearPast = root.require('./general/commands/clearPast')
const cleanup = root.require('./general/commands/cleanup')

module.exports = (client, msg) => {
  if (msg.author.bot) return

  if (!msg.guild) {
    if (msg.cleanContent.toLowerCase().startsWith('?accuse')) {
      accuse(msg)
      return
    } else if (msg.cleanContent.toLowerCase().startsWith('?vote')) {
      vote(msg)
      return
    } else if (msg.cleanContent.toLowerCase().startsWith('?kill')) {
      if (kill(msg) != 'only mafia can use ?kill') return
    } else if (msg.cleanContent.toLowerCase().startsWith('?inspect')) {
      if (inspect(msg) != 'only cops can use ?inspect') return
    }
  }
  if (!msg.guild && botchats.has(msg.author)) {
    const toSend = `**${msg.author.username}:**  ${msg.content}`
    const bcusers = botchats.get(msg.author)
    bcusers.forEach(user => {
      if (user != msg.author) user.send(toSend)
    })
    return
  }

  if (
    !msg.content.startsWith('?') ||
    msg.content.replace(/[?]/g, '').trim() == '' ||
    msg.content.replace(/[?]/g, '').substring(0, 1) == ' '
  )
    return

  // todo: check that you have admin permissions first and return error if you don't

  if (msg.content.toLowerCase() == '?ping') {
    msg.reply('Pong!')
  } else if (msg.content.toLowerCase() == '?help') {
    help(msg)
  } else if (msg.content.toLowerCase().startsWith('?mafia')) {
    lobby(msg, 'mafia')
  } else if (msg.content.toLowerCase().startsWith('?ready')) {
    readyCommand(msg)
  } else if (msg.content.toLowerCase().startsWith('?cancel')) {
    cancel(msg)
  } else if (msg.content.toLowerCase() == '?cleanup') {
    if (runningGames[msg.guild] && runningGames[msg.guild].status == 'ended')
      cleanup(runningGames[msg.guild])
  } else if (msg.content.toLowerCase() == '??end') {
    //only for debugging
    if (runningGames[msg.guild] && runningGames[msg.guild].status != 'lobby')
      end(runningGames[msg.guild])
    else
      msg.reply(
        'That debugging command can only be used during a running game.'
      )
  } else if (msg.content.toLowerCase() == '??clear') {
    //only for debugging
    clearPast(msg)
  } else if (msg.content.toLowerCase() == '??unmute') {
    msg.guild.members.cache.forEach(member =>
      member.edit({ mute: false }).catch(() => {})
    )
  } else if (msg.content.replace(/[?]/g, '').substring(0, 1) != ' ') {
    msg.reply(
      'That\'s not a command. To see the full list of commands, type "?help".'
    )
  }
}
