import { referenciables, scopes } from '../definitions'
import { dispatchByType } from '../../model'

export const createScopesStep = node => ({
  ...node,
  ...isScopeable(node.type) && { scope: createScope(node) }
})

const scopeElementsFor = dispatchByType(scopes, () => [])
const nameFor = dispatchByType(referenciables, _ => _.name)

const isScopeable = type => !!scopeElementsFor(type, () => false)
const createScope = node => scopeElementsFor(node).reduce((scope, e) => ({
  ...scope,
  [nameFor(e)]: e.path
}), {})

