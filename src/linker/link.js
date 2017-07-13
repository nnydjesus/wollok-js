import Linker from './linker'
import { visit } from '../model/visiting'

export const linkParent = node => visit(node, (node, parent) => { 
  if (parent) node.parent = parent
})

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
