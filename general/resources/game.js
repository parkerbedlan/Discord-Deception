const { botchats } = require('../../bot')
const { Permissions } = require('discord.js')

module.exports = function Game(type, host, guild, status = 'lobby') {
  if (!new Set(['mafia']).has(type)) {
    throw "Oi bruv that game doesn't even exist yet."
  }
  if (!new Set(['lobby', 'playing']).has(status)) {
    throw "Aye homes that status ain't a thing."
  }
  this.type = type
  this.host = host
  this.guild = guild
  this.status = status
  this.players = new Set()
  this.lobbyMsg = null
  this.playersRole = null
  this.muted = false
  this.firstNight = true
  this.readyCount = 0

  this.handlers = {}
  this.on = (eventName, handler) => {
    if (!this.handlers[eventName]) this.handlers[eventName] = []

    this.handlers[eventName].push(handler)
  }
  this.emit = (eventName, ...args) => {
    for (const handler of this.handlers[eventName]) handler(...args)
  }

  this.messagePlayers = async message => {
    return Promise.all(
      Array.from(this.players).map(player => player.send(message))
    )
  }

  this.messageAlive = async message => {
    return Promise.all(
      Array.from(this.alive).map(player => player.send(message))
    )
  }

  this.setPermissions = stage => {
    if (stage !== 'night' && stage !== 'morning' && stage !== 'end')
      throw Error('invalid stage')
    this.categoryChannel.overwritePermissions([
      {
        id: this.guild.roles.cache.find(r => r.name == '@everyone'),
        type: 'role',
        deny: new Permissions(2147483647),
      },
      {
        id: this.playersRole,
        type: 'role',
        allow:
          stage === 'night'
            ? new Permissions(34669568)
            : new Permissions(37162048),
        deny:
          stage === 'night'
            ? new Permissions(2112289279)
            : new Permissions(2109796799),
      },
      {
        id: this.deadRole,
        type: 'role',
        allow:
          stage === 'end'
            ? new Permissions(37162048)
            : new Permissions(34669568),
        deny:
          stage === 'end'
            ? new Permissions(2109796799)
            : new Permissions(2112289279),
      },
    ])
  }
}
