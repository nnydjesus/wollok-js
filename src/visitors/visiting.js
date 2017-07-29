import { toVisitor } from './commons'
import { identity, isFunction } from '../utils/functions'
import { propertyValues } from '../utils/object'

// winston.level = 'silly'

// this should be in the linker !
const ignoredTypes = 'Ref'
const ignoredKeys = ['parent', 'path', 'scope']

/**
 * Visits a Node and all of its inner nodes (objects with "type" property)
 * applying the provided Visitor.
 * 
 * @param {*} node Node to start visiting
 * @param {*} Visitor ({ enter(node, parent), exit(node, parent) })
 * @param {*} parent (not be send from outside, just for recursion)
 */
export const visit = fnOrVisitor => visitWithVisitor(toVisitor(fnOrVisitor))

const visitWithVisitor = ({ enter = identity, exit = identity }, parent, feature, index) => node => {
  if (!node.type || ignoredTypes.includes(node.type)) return node
  let folded = enter(node, parent, feature, index) || node
  folded = visitProperties(folded, enter, exit) || folded
  return exit(folded, parent, feature, index) || folded
}

const visitProperties = (node, enter, exit) => propertyValues(node).reduce(
  (copy, { name, value }) => visitProperty(copy, name, value, enter, exit), node)

const visitProperty = (node, name, value, enter, exit) => ({
  ...node,
  [name]: shouldIgnore(name, value) ? value : newPropertyValue(node, name, value, enter, exit)
})

const shouldIgnore = (name, value) => ignoredKeys.includes(name) || isFunction(value)

const newPropertyValue = (node, name, value, enter, exit) => {
  const isArray = Array.isArray(value)
  const list = isArray ? value : (value && [value] || [])

  const mapped = list.map((e, i) =>
    (e.type ? visitWithVisitor({ enter, exit }, node, name, isArray ? i : undefined)(e) : e)
  )
  return isArray ? mapped : mapped[0]
}

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