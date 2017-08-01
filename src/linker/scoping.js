import { collect } from '../visitors/commons'

export const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))

export const scopeFor = node => {
  if (!node) return {}
  return {
    ...node.scope,
    ...scopeFor(node.parent)
  }
}

export const lookupParentScope = node => {
  if (!node) throw new Error('No scopeable node to register referenciable !')
  return node.scope ? node : lookupParentScope(node.parent)
}

// TODO: slice is to remove 'root' !
export const resolvePath = (fromNode, path) => {
  try {
    return path.slice(1).reduce((n, feature) => accessPathPart(n, parsePathPart(feature))
      , fromNode.root())
  } catch (e) {
    throw new Error(`Error accessing path ${path.join('.')}: "${e.message}"`)
  }
}

export const parsePathPart = part => {
  /* eslint no-unused-vars: 0 */
  const [_, feature, index] = part.split(/^([^[]*)\[?(\d*)\]?$/)
  return { feature, ...index && { index: parseInt(index) } }
}

const accessPathPart = (node, part) => {
  const value = node[part.feature]
  return part.index !== undefined ? value[part.index] : value
}