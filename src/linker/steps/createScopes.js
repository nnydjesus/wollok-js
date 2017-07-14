import { Context } from '../context'
import { referenciables, isScopeable } from '../definitions'
import { visit } from '../../visitors/visiting'

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