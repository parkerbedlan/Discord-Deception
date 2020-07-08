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
}
