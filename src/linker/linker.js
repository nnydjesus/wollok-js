// simple for now
const typeOf = e => (Array.isArray(e) ? 'array' : typeof e)

export const linkParent = (node, parent) => {
  switch (typeOf(node)) {
    case 'array': {
      node.forEach(e => linkParent(e, parent))
      break
    }
    case 'object': {
      Object.keys(node).forEach(key => {
        linkParent(node[key], node)
      })
      if (parent) {
        node.parent = parent
      }
      break;
    }
    default:
  }
  return node
}