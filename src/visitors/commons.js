import { visit } from './visiting'
import { filter } from '../utils/functions'

// common high-level visitors

export const filtering = (condition, { enter, exit }) => ({
  ...(enter && { enter: filter(condition, enter) }),
  ...(exit && { exit: filter(condition, exit) })
})

export const collect = (node, mapper) => {
  const collected = []
  visit(node, {
    enter(n) {
      collected.push(mapper(n))
    }
  })
  return collected
}