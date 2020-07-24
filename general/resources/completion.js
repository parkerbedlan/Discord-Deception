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
    if (resolvers[event]) {
      console.log('resolving', event)
      resolvers[event]()
      delete resolvers[event]
      return
    }
    console.log('presolving', event)
    presolvers[event] = true
  },
}
