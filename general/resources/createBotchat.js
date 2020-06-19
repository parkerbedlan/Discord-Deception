module.exports = function createBotchat(userSet)
{
    let bcusers = new Map()
    userSet.forEach(user => bcusers.set(user.id, user))
    let bcusersStr = ''
    bcusers.forEach(user => {
        bcusersStr += user.username + '\n'
        botchats.set(user, bcusers)
    })
    return [bcusers, bcusersStr]
}