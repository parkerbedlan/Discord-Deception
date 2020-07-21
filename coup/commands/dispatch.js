module.exports = game => {
  const action = game.currentAction[game.currentAction.length - 1]
  console.log('dispatching', action.type)
  throw Error('not yet implemented')
  // todo: do action
  // todo: use nextAction after it's done
}
