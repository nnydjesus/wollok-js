import { linkParent } from './link'
import { Context } from './context'
import { Block, Program, File, ClassDeclaration, MethodDeclaration, Closure, ObjectDeclaration, MixinDeclaration } from '../model'
import { visit } from '../model/visiting'
import { ExtendableError } from '../utils/error'

export class LinkerError extends ExtendableError { }

// winston.level = 'silly'

/* nodes that define new scopes/namespaces */
const scopeables = [
  File.name,
  Program.name,
  ClassDeclaration.name,
  ObjectDeclaration.name,
  MethodDeclaration.name,
  MixinDeclaration.name,
  Closure.name,
  Block.name
]
const isScopeable = type => scopeables.includes(type)

const byName = n => n.name
/* nodes which gets registered in their parent's scope */
const referenciables = {
  VariableDeclaration: _ => byName(_.variable),
  FieldDeclaration: _ => byName(_.variable),
  Param: byName,
  ClassDeclaration: byName,
  MixinDeclaration: byName,
  ObjectDeclaration: byName
}

const linkeables = {
  Variable: v => v.name,
  New: n => n.target,
  SuperType: s => s.name
}

export default class Linker {
  link(node) {
    this.firstPass(node)
    this.secondPass(node)
    return node
  }
  firstPass(node) {
    const context = new Context()
    linkParent(node) // link parent should be a command within the first pass
    new CreateScopesVisitor(context).visit(node)
  }
  secondPass(node) {
    const visitor = new LinkVisitor()
    visitor.visit(node)
    // TODO: backward compat error handling. This should be modelled better
    if (visitor.unresolvables.length > 0) {
      throw new LinkerError(`Cannot resolve reference to '${visitor.unresolvables[0]}' at ???`)
    }
  }
}

class Visitor {
  visit(node) {
    visit(node, ::this.onNode, ::this.afterNode)
  }
  onNode() { }
  afterNode() { }
}

class CreateScopesVisitor extends Visitor {
  constructor(context) {
    super()
    this.context = context
  }

  onNode(node) {
    const type = node.nodeType

    if (referenciables[type]) {
      const name = referenciables[type](node)
      this.context.register(node, name)
    }

    if (isScopeable(type)) {
      this.context.push(node)
    }
  }

  afterNode(node) {
    const type = node.nodeType
    if (isScopeable(type)) {
      this.context.pop()
    }
  }

}

class LinkVisitor extends Visitor {
  constructor() {
    super()
    this.unresolvables = []
  }
  onNode(node) {
    const type = node.nodeType
    // try to link on the first pass if linkable
    if (linkeables[type]) {
      const name = linkeables[type](node)
      // HACK for now I need to resolve ref to Object !!!!!!! 
      if (name !== 'Object') {
        const found = findInScope(node, name)
        if (found) {
          node.link = found
        } else {
          this.unresolvables.push(name)
        }
      }
    }
  }
}

// scoping

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))
