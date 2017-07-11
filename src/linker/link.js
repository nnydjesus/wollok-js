import Linker from './Linker'

export const linkParent = (node, parent) => {
  if (Array.isArray(node)) {
    node.forEach(e => linkParent(e, parent))
  //
  } else if ((typeof node) === 'object') {
    Object.keys(node).forEach(key => linkParent(node[key], node))
    if (parent) {
      node.parent = parent
    }
  }
  return node
}

export const link = (node) => {
  const linker = new Linker()
  return linker.link(node)
}


