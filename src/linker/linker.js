import winston from 'winston'
import { Program, ClassDeclaration, MethodDeclaration, Closure, ObjectDeclaration } from '../model'
import { visitor } from '../model/visiting'
import { ExtendableError } from '../utils/error'

export class LinkerError extends ExtendableError { }

// winston.level = 'silly'

/* nodes that define new scopes/namespaces */
const scopingAware = [
  Program,
  ClassDeclaration,
  ObjectDeclaration,
  MethodDeclaration,
  Closure
]

export default class Linker {

  link(node) {
    const context = new Context();

    const visit = {
      // variables
      visitVariableDeclaration(declaration) { context.register(declaration, declaration.variable.name) },
      visitParam(param) { context.register(param, param.name) },

      // linking
      visitVariable(variable) {
        winston.silly(`Linking variable ${variable.name}`)
        variable.link = context.resolve(variable)
        winston.silly('Linked variable to ', variable.link)
      }
    }
    // contexts
    scopingAware.forEach(scoped => {
      visit[`visit${scoped.name}`] = ::context.push;
      visit[`after${scoped.name}`] = ::context.pop;
    })

    visitor(visit)(node)
    return node
  }
}

class Context {
  constructor() {
    this.context = []
  }
  peek() { return (this.context.length > 0 ? this.context[this.context.length - 1] : undefined) }
  push(c) { this.context.push(c) }
  pop() { this.context.pop() }

  register(referenciable, name) {
    const current = this.peek()
    current.scope = {
      ...(current && current.scope),
      [name]: referenciable
    }
  }
  resolve(variable) {
    return failIfNotFound(this.context.reduceRight(
      (found, { scope }) => found || (scope && scope[variable.name]),
      undefined
    ), `Cannot resolve reference to '${variable.name}' at ???`)
  }
}

const failIfNotFound = (value, message) => {
  if (!value) throw new LinkerError(message)
  return value
}