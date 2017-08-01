
export const findInScope = (nodes, name) => nodes.reduceRight((found, node) =>
  (found || ((node.scope && node.scope[name]) ? node.scope[name] : undefined)), undefined)

// TODO: slice is to remove 'root' !
// TODO: this mechanism depends on the AST to be navigable up (parent + root())
export const resolvePath = (fromNode, path) => {
  try {
    return path.slice(1).reduce((n, feature) => accessPathPart(n, parsePathPart(feature))
      , fromNode.root())
  } catch (e) {
    throw new Error(`Error accessing path ${path.join('.')}: "${e.message}"`)
  }
}

export const parsePathPart = part => parsedToPath(part.split(/^([^[]*)\[?(\d*)\]?$/))
const parsedToPath = ([, feature, index]) => ({ feature, ...index && { index: parseInt(index) } })

const accessPathPart = (node, part) => {
  const value = node[part.feature]
  return part.index !== undefined ? value[part.index] : value
}