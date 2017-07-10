import { visitor } from '../../src/model/visiting'
import { ExtendableError } from '../../src/utils/error'

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

class LinkerError extends ExtendableError { }

export const link = (node) => {
  const context = [];
  context.peek = () => (context.length > 0 ? context[context.length - 1] : undefined)
  const push = c => context.push(c)
  const pop = c => context.pop(c)

  visitor({
    visitProgram: push,
    afterProgram: pop,

    visitClassDeclaration: push,
    aftetClassDeclaration: pop,

    visitVariableDeclaration(declaration) {
      const current = context.peek()
      current.context = {
        ...(current && current.context),
        [declaration.variable.name]: declaration
      }
    },
    visitVariable(variable) {
      // TODO go up in the context or throw unresolved variable (?)
      const value = context.peek().context[variable.name]
      if (!value) {
        throw new LinkerError(`Cannot resolve reference to '${variable.name}' at ???`)
      }
      variable.link = value
    }
  })(node)
  return node
}


