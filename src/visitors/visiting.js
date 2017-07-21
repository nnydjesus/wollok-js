// this should be in the linker !
const ignoredKeys = ['parent', 'link']

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
export const visit = (node, { enter, exit = () => { } }, parent) => {
  if (!node.type) { return node }

  const folded = enter(node, parent) || node

  Object.keys(node).forEach(key => {
    if (ignoredKeys.includes(key)) return
    const value = node[key]
    const list = Array.isArray(value) ? value : (value && [value] || [])
    list.filter(e => e.type).forEach((e, i) => {
      visit(e, { enter, exit }, node)
    })
  })
  return exit(node, parent) || folded
}


// AST utils
// not sure where to move this to :S
// I think it is only used for tests

export const queryNodeByType = (root, type, filter = () => true) => {
  const possibles = []
  const matches = []

  visit(root, {
    enter(node) {
      possibles.push(node.type)
      if (node.type === type && filter(node)) {
        matches.push(node)
      }
    }
  })
  if (matches.length === 0) {
    throw new Error(`Could NOT find node ${type}. Visited node types: ${possibles.join()}`)
  }
  return matches
}