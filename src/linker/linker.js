import { visitor } from '../../src/model/visiting'

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


export const link = (node) => {
  const context = [];
  context.peek = () => (context.length > 0 ? context[context.length - 1] : undefined)

  visitor({
    visitProgram(program) {
      context.push(program)
    },
    afterProgram() {
      context.pop()
    },
    visitVariableDeclaration(declaration) {
      const current = context.peek()
      current.context = {
        ...(current && current.context),
        [declaration.variable.name]: declaration
      }
    },
    visitVariable(variable) {
      // TODO go up in the context or throw unresolved variable (?)
      variable.link = context.peek().context[variable.name]
    }
  })(node)
  return node
}


