import { Context } from '../context'
import { referenciables, isScopeable } from '../definitions'

export const createScopesStep = (context = new Context()) => ({
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