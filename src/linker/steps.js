import { Context } from './context'
import { visit } from '../model/visiting'
import { referenciables, isScopeable, linkeables } from './definitions'

export const linkParentStep = node => visit(node, {
  onNode(node, parent) {
    if (parent) node.parent = parent
  }
})

export const createScopesStep = (node, context = new Context()) => visit(node, {
  onNode(node) {
    const type = node.nodeType

    if (referenciables[type]) {
      const name = referenciables[type](node)
      context.register(node, name)
    }

    if (isScopeable(type)) {
      context.push(node)
    }
  },

  afterNode(node) {
    const type = node.nodeType
    if (isScopeable(type)) {
      context.pop()
    }
  }
})

export const linkStep = (node, unresolvables = []) => {
  visit(node, {
    onNode(n) {
      const type = n.nodeType
      if (linkeables[type]) {
        const name = linkeables[type](n)
        // HACK for now I need to resolve ref to Object !!!!!!! 
        if (name !== 'Object') {
          const found = findInScope(n, name)
          if (found) {
            n.link = found
          } else {
            unresolvables.push(name)
          }
        }
      }
    }
  })
  return unresolvables
}

// scoping

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))
