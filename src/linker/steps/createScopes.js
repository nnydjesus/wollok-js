import { onEnter } from '../../visitors/commons'
import { referenciables, isScopeable } from '../definitions'
import { lookupParentScope } from '../scoping'

export const createScopesStep = onEnter(node => {
  const { type } = node

  if (referenciables[type]) {
    const name = referenciables[type](node)
    lookupParentScope(node).scope[name] = node
  }

  if (isScopeable(type)) {
    node.scope = {}
  }
})