import Linker from './linker'

export const linkParent = (node, parent) => {
  if (Array.isArray(node)) {
    node.forEach(e => linkParent(e, parent))
  //
  } else if ((typeof node) === 'object') {
    Object.keys(node).forEach(key => linkParent(node[key], node))
    if (parent) node.parent = parent
  }
  return node
}

/** 
 * Performs linking on the given (root?) node.
 * Returned `Node(type=Variable)` will have a "link" property pointing to 
 * the VariableDeclaration|Param.
 * Also some context-defining nodes like ClassDeclarartion|Closure|Method..etc
 * will have a "scope" property with an object with name-variableDeclaration representing the 
 * locally available variables.
 */
export const link = (node) => {
  const linker = new Linker()
  return linker.link(node)
}


