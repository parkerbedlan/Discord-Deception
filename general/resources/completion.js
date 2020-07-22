const resolvers = {}
const presolvers = {}
module.exports = {
  completionOf: event =>
    new Promise((resolve, reject) => {
      if (presolvers[event]) {
        presolvers[event] = false
        resolve()
      } else resolvers[event] = resolve
    }),
  complete: event => {
    if (resolvers[event]) return resolvers[event]()
    presolvers[event] = true
  },
}
