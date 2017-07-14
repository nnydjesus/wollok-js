import { Context } from './context'
import { visit } from './visiting'
import { referenciables, isScopeable, linkeables } from './definitions'
import { ExtendableError } from '../utils/error'

export class LinkerError extends ExtendableError { }

export const linkParentStep = node => visit(node, {
  enter(node, parent) {
    if (parent) node.parent = parent
  }
})

export const createScopesStep = (node, context = new Context()) => visit(node, {
  enter(node) {
    const { type } = node

    if (referenciables[type]) {
      const name = referenciables[type](node)
      context.register(node, name)
    }

    if (isScopeable(type)) {
      context.push(node)
    }
  },

  exit({ type }) {
    if (isScopeable(type)) {
      context.pop()
    }
  }
})

export const linkStep = (node, unresolvables = []) => {
  visit(node, {
    enter(n) {
      const { type } = n
      if (linkeables[type]) {
        const name = linkeables[type](n)
        // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
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
  return { node, unresolvables }
}

export const checkAndFailStep = ({ node, unresolvables }) => {
  // TODO: backward compat error handling. This should be modelled better
  if (unresolvables.length > 0) {
    throw new LinkerError(`Cannot resolve reference to '${unresolvables[0]}' at ???`)
  }
  return node
}

// scoping

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))
