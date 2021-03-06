import { visit } from './visiting'
import { filter, isFunction } from '../utils/functions'

// common high-level visitors

export const onEnter = enter => ({ enter })
export const onExit = exit => ({ exit })
export const toVisitor = fnOrVisitor => (isFunction(fnOrVisitor) ? ({ enter: fnOrVisitor }) : fnOrVisitor)

export const filtering = (condition, fnOrVisitor) =>
  filteringVisitor(condition, toVisitor(fnOrVisitor))

const filteringVisitor = (condition, { enter, exit }) => ({
  ...(enter && { enter: filter(condition, enter) }),
  ...(exit && { exit: filter(condition, exit) })
})

export const collect = (node, mapper) => {
  const collected = []
  visit({ enter(n, context) { collected.push(mapper(n, context)) } })(node)
  return collected
}

export const chain = (...visitorsOrFunctions) => {
  const visitors = visitorsOrFunctions.map(toVisitor)
  return ({
    ...chained('enter', visitors),
    ...chained('exit', visitors)
  })
}

const chained = (fnName, visitors) => ({
  [fnName]: (node, context) => visitors.reduce(
    (acc, visitor) => (visitor[fnName] ? (visitor[fnName](acc, context) || acc) : acc),
    node
  )
})