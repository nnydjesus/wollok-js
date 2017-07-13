import winston from 'winston'
import { Context } from './context'
import { VariableDeclaration, Field, Variable, New, Parameter, Block, Program, File, Class, Method, Closure, Singleton, Mixin } from '../model'
import { visit } from './visiting'

// winston.level = 'silly'

/* nodes that define new scopes/namespaces */
const scopeables = [
  File.name,
  Program.name,
  Class.name,
  Singleton.name,
  Method.name,
  Mixin.name,
  Closure.name,
  Block.name
]
const isScopeable = type => scopeables.includes(type)

const byName = n => n.name
/* nodes which gets registered in their parent's scope */
const referenciables = {
  [VariableDeclaration.name]: _ => byName(_.variable),
  [Field.name]: _ => byName(_.variable),
  [Parameter.name]: byName,
  [Class.name]: byName,
  [Mixin.name]: byName,
  [Singleton.name]: byName
}

const linkeables = {
  [Variable.name]: v => v.name,
  [New.name]: n => n.target,
  [Class.name]: c => c.superclass
}

export default class Linker {
  link(node) {
    const context = new Context()
    visit(node, ::this.onNode(context), ::this.afterNode(context))
    return node
  }

  onNode(context) {
    return node => {
      const { type } = node

      // register it in scope if applies
      if (referenciables[type]) {
        const name = referenciables[type](node)
        winston.silly('>RR> registering', type, '(', name, ')')
        context.register(node, name)
      }

      // push it (fucker) if it is a context
      if (isScopeable(type)) {
        winston.silly('>>>> pushing', type)
        context.push(node)
      }

      // link it if linkable
      if (linkeables[type]) {
        winston.silly('???? checking', type)
        const name = linkeables[type](node)
        if (name !== 'Object') { // HACK for now I need to resolve ref to Object !!!!!!! 
          node.link = context.resolve(name)
        }
      }
    }
  }

  afterNode(context) {
    return node => {
      const type = node.type

      if (isScopeable(type)) {
        winston.silly('<<<< poping', type)
        context.pop()
      }
    }
  }
}
