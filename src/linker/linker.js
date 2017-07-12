import winston from 'winston'
import { Context } from './context'
import { Program, File, ClassDeclaration, MethodDeclaration, Closure, ObjectDeclaration, MixinDeclaration } from '../model'
import { visit } from '../model/visiting'

// winston.level = 'silly'

/* nodes that define new scopes/namespaces */
const scopeables = [
  File.name,
  Program.name,
  ClassDeclaration.name,
  ObjectDeclaration.name,
  MethodDeclaration.name,
  MixinDeclaration.name,
  Closure.name
]
const isScopeable = type => scopeables.includes(type)

const byName = n => n.name

/* nodes which gets registered in their parent's scope */
const referenciables = {
  VariableDeclaration: _ => byName(_.variable),
  Param: byName,
  ClassDeclaration: byName,
  MixinDeclaration: byName,
  ObjectDeclaration: byName
}

const linkeables = {
  Variable: v => v.name,
  New: n => n.target
}

export default class Linker {
  link(node) {
    const context = new Context()
    visit(node, ::this.onNode(context), ::this.afterNode(context))
    return node
  }

  onNode(context) {
    return node => {
      const type = node.nodeType

      // register it in scope if applies
      if (referenciables[type]) {
        const name = referenciables[type](node)
        winston.silly('>RR> registering', type, '(', name, ')')
        context.register(node, name)
      }

      // push it (fucker)
      if (isScopeable(type)) {
        winston.silly('>>>> pushing', type)
        context.push(node)
      }

      // link it if linkable
      if (linkeables[type]) {
        winston.silly('???? checking', type)
        const nameExtractor = linkeables[type]
        node.link = context.resolve(nameExtractor(node))
      }
    }
  }

  afterNode(context) {
    return node => {
      const type = node.nodeType

      if (isScopeable(type)) {
        winston.silly('<<<< poping', type)
        context.pop()
      }
    }
  }
}
