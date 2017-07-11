import winston from 'winston'
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

  const addToContext = (referenciable, name) => {
    const current = context.peek()
    current.scope = {
      ...(current && current.scope),
      [name]: referenciable
    }
  }

  visitor({
    // contexts
    visitProgram: push,
    afterProgram: pop,

    visitClassDeclaration: push,
    afterClassDeclaration: pop,

    visitNamedObjectDeclaration: push,
    afterNamedObjectDeclaration: pop,

    visitMethodMethodDeclaration: push,
    afterMethodDeclaration: pop,

    visitClosure: push,
    afterClosure: pop,

    // variables
    visitVariableDeclaration(declaration) { addToContext(declaration, declaration.variable.name) },
    visitParam(param) { addToContext(param, param.name) },

    // checks
    visitVariable(variable) {
      winston.silly(`Linking variable ${variable.name}`)
      // TODO go up in the context or throw unresolved variable (?)
      const value = context.peek().scope && context.peek().scope[variable.name]
      if (!value) {
        throw new LinkerError(`Cannot resolve reference to '${variable.name}' at ???`)
      }
      variable.link = value
      winston.silly('Linked variable to ', value)
    }
  })(node)
  return node
}


