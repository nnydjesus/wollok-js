import { toVisitor } from './commons'
import { identity } from '../utils/functions'
import { propertyValues } from '../utils/object'

// winston.level = 'silly'

// this should be in the linker !
const ignoredTypes = 'Ref'
const ignoredKeys = ['parent']

/**
 * Visits a Node and all of its inner nodes (objects with "type" property)
 * applying the provided Visitor.
 * 
 * @param {*} node Node to start visiting
 * @param {*} Visitor ({ enter(node, parent), exit(node, parent) })
 * @param {*} parent (not be send from outside, just for recursion)
 */
export const visit = fnOrVisitor => visitWithVisitor(toVisitor(fnOrVisitor))

const visitWithVisitor = ({ enter = identity, exit = identity }, parent, feature) => node => {
  if (!node.type || ignoredTypes.includes(node.type)) return node
  let folded = enter(node, parent, feature) || node
  folded = visitProperties(folded, enter, exit) || folded
  return exit(folded, parent, feature) || folded
}

const visitProperties = (node, enter, exit) =>
  propertyValues(node).reduce((copy, { name, value }) => {
    if (ignoredKeys.includes(name)) {
      copy[name] = value
      return copy
    }
    const isArray = Array.isArray(value)
    const list = isArray ? value : (value && [value] || [])
    const visited = list.map(e =>
      (e.type ? visitWithVisitor({ enter, exit }, node, name)(e) : e)
    )
    copy[name] = isArray ? visited : visited[0]
    return copy
  }, node)

// AST utils
// not sure where to move this to :S
// I think it is only used for tests

export const queryNodeByType = (root, type, filter = () => true) => {
  const possibles = []
  const matches = []

  visit({
    enter(node) {
      possibles.push(node.type)
      if (node.type === type && filter(node)) {
        matches.push(node)
      }
    }
  })(root)
  if (matches.length === 0) {
    throw new Error(`Could NOT find node ${type}. Visited node types: ${possibles.join()}`)
  }
  return matches
}