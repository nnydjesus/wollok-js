import winston from 'winston'
import { visitor } from '../../src/model/visiting'
import { ExtendableError } from '../../src/utils/error'

export class LinkerError extends ExtendableError { }

// winston.level = 'silly'

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
    winston.silly(`Resolving ${variable.name}`)
    const value = this.context.reduceRight((found, { nodeType, scope }) => {
      winston.silly(`\tLooking for ${variable.name} in ${nodeType}: ${Object.keys(scope || {}).join(', ')}`)
      if (!found && scope && scope[variable.name]) {
        return scope[variable.name]
      }
      return found
    }, undefined)
    if (!value) {
      throw new LinkerError(`Cannot resolve reference to '${variable.name}' at ???`)
    }
    return value
  }
}

export default class Linker {

  link(node) {
    const context = new Context();

    visitor({
      // contexts
      visitProgram: ::context.push,
      afterProgram: ::context.pop,

      visitClassDeclaration: ::context.push,
      afterClassDeclaration: ::context.pop,

      visitNamedObjectDeclaration: ::context.push,
      afterNamedObjectDeclaration: ::context.pop,

      visitMethodDeclaration: ::context.push,
      afterMethodDeclaration: ::context.pop,

      visitClosure: ::context.push,
      afterClosure: ::context.push,

      // variables
      visitVariableDeclaration(declaration) { context.register(declaration, declaration.variable.name) },
      visitParam(param) { context.register(param, param.name) },

      // linking
      visitVariable(variable) {
        winston.silly(`Linking variable ${variable.name}`)
        variable.link = context.resolve(variable)
        winston.silly('Linked variable to ', variable.link)
      }
    })(node)
    return node
  }
}