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

// type Context { 
//   parent, feature, index
// }

const visitWithVisitor = ({ enter = identity, exit = identity }, context = {}) => node => {
  if (!node.type || ignoredTypes.includes(node.type)) return node
  let folded = enter(node, context) || node
  folded = visitProperties(context, folded, enter, exit) || folded
  return exit(folded, context) || folded
}

const visitProperties = (context, node, enter, exit) => propertyValues(node).reduce(
  (copy, { name, value }) => visitProperty(context, copy, name, value, enter, exit), node)

const visitProperty = (context, node, name, value, enter, exit) => ({
  ...node,
  [name]: shouldIgnore(name, value) ? value : newPropertyValue(context, node, name, value, enter, exit)
})

const shouldIgnore = (name, value) => ignoredKeys.includes(name) || isFunction(value)

const newPropertyValue = (context, node, name, value, enter, exit) => {
  const isArray = Array.isArray(value)
  const list = isArray ? value : (value && [value] || [])
  const childContext = {
    parents: [...(context.parents || []), node],
    parent: node,
    feature: name
  }
  const createChildContext = isArray ? (index => ({ ...childContext, index })) : () => childContext

  const mapped = list.map((e, i) =>
    (e.type ? visitWithVisitor({ enter, exit }, createChildContext(i))(e) : e)
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