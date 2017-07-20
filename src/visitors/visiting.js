import winston from 'winston'
import { noop } from '../utils/functions'

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
// It would be really nice to convert this into a higher-order function like:
//     visit = ({ enter, exit = () => {} }, parent) => node => {}
// :)
export const visit = ({ enter = noop, exit = noop }, parent, feature) => node => {
  if (!node.type || ignoredTypes.includes(node.type)) { return node }
  winston.silly(`visiting ${node.type}`)

  const folded = enter(node, parent, feature) || node

  Object.keys(node).forEach(key => {
    if (ignoredKeys.includes(key)) return
    const value = node[key]
    const list = Array.isArray(value) ? value : (value && [value] || [])
    list.filter(e => e.type).forEach((e, i) => {
      winston.silly(`\tvisiting ${node.type}.${key}[${i}]`)
      visit({ enter, exit }, node, key)(e)
    })
  })
  return exit(node, parent, feature) || folded
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