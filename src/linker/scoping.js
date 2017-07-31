
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
export const resolvePath = (fromNode, path) => path.slice(1).reduce(
  (n, feature) => (
    feature.indexOf('[') >= 0 ?
      parsingIndexed(feature, ({ feature, index }) => n[feature][index])
      : n[feature]
  )
  , fromNode.root())

// TODO: improve this with a RegExp :P
const parsingIndexed = (token, cb) => {
  const feature = token.slice(0, token.indexOf('['))
  const index = parseInt(token.slice(token.indexOf('[') + 1, token.indexOf(']')))
  return cb({ feature, index })
}