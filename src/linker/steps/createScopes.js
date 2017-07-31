import { referenciables, isScopeable } from '../definitions'
import { lookupParentScope } from '../scoping'

export const createScopesStep = node => ({
  ...node,
  ...isScopeable(node.type) && { scope: {} }
})

// EFFECT !! this should be completely changed !
export const registerReferenciable = node => {
  const { type } = node
  if (referenciables[type]) {
    const name = referenciables[type](node)
    lookupParentScope(node.parent).scope[name] = node.path
  }
  return node
}
