import { referenciables, isScopeable } from '../definitions'
import { lookupParentScope } from '../scoping'

export const createScopesStep = node => {
  const { type } = node

  const copy = {
    ...node,
    ...isScopeable(type) && { scope: {} }
  }

  // EFFECT !! this should be completely changed !
  if (referenciables[type]) {
    const name = referenciables[type](copy)
    lookupParentScope(copy.parent).scope[name] = copy
  }

  return copy
}
