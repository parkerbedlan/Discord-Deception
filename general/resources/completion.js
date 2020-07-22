const resolvers = {}
module.exports = {
  completionOf: event =>
    new Promise((resolve, reject) => {
      resolvers[event] = resolve
    }),
  complete: event => resolvers[event](),
}
