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

  const resolve = variable => {
    winston.silly(`Resolving ${variable.name}`)
    const value = context.reduceRight((found, { nodeType, scope }) => {
      winston.silly(`\tLooking for ${variable.name} in ${nodeType}: `, Object.keys(scope))
      if (!found && scope && scope[variable.name]) {
        return scope[variable.name]
      }
      return found
    })
    if (!value) {
      throw new LinkerError(`Cannot resolve reference to '${variable.name}' at ???`)
    }
    return value
  }

  visitor({
    // contexts
    visitProgram: push,
    afterProgram: pop,

    visitClassDeclaration: push,
    afterClassDeclaration: pop,

    visitNamedObjectDeclaration: push,
    afterNamedObjectDeclaration: pop,

    visitMethodDeclaration: push,
    afterMethodDeclaration: pop,

    visitClosure: push,
    afterClosure: pop,

    // variables
    visitVariableDeclaration(declaration) { addToContext(declaration, declaration.variable.name) },
    visitParam(param) { addToContext(param, param.name) },

    // linking
    visitVariable(variable) {
      winston.silly(`Linking variable ${variable.name}`)
      // TODO go up in the context or throw unresolved variable (?)
      const value = resolve(variable)
      variable.link = value
      winston.silly('Linked variable to ', value)
    }
  })(node)
  return node
}


