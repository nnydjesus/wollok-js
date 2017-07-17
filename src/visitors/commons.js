import { visit } from './visiting'
import { filter } from '../utils/functions'

// common high-level visitors

export const filtering = (condition, { enter, exit }) => ({
  ...(enter && { enter: filter(condition, enter) }),
  ...(exit && { exit: filter(condition, exit) })
})

export const collect = (node, mapper) => {
  const collected = []
  visit(node, { enter(n) { collected.push(mapper(n)) } })
  return collected
}

export const chain = (...visitors) => ({
  ...chained('enter', visitors),
  ...chained('exit', visitors)
})
const chained = (fnName, visitors) => ({
  [fnName]: (node, parent) => {
    const reduced = visitors.reduce(
      (acc, visitor) => (visitor[fnName] ? (visitor[fnName](acc, parent) || acc) : acc),
      node
    )
    return reduced
  }
})