import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'
import { findInScope } from '../scoping'
import { appendError, createUnresolvedLinkageError, createWrongTypeLinkageError } from '../errors'
import { isArray, forAll } from '../../utils/collections'
import { node as Node } from '../../model'

// winston.level = 'debug'

export const Ref = (token, node) => Node(Ref)({ token, node })

const isLinkeable = ({ type }) => linkeables[type]

export const linkStep = visit(filtering(isLinkeable, n => {
  const { type } = n
  doLink(n, linkeables[type])
  return n
}))

const doLink = (node, linkDef) => Object.keys(linkDef).forEach(feature => {
  link(node, feature, linkDef[feature])
})

const tempIgnore = ['Object', 'wollok.lang.Object', 'console', 'StringPrinter', 'wollok.lang.Exception', 'runtime', 'Exception']

const link = (node, feature, linkType) => {
  const refValue = node[feature]

  if (alreadyLinked(refValue)) { return }
  // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
  if (tempIgnore.indexOf(refValue) >= 0) { return }

  // resolve and assign (and / or error)
  let resolution;
  if (refValue === 'self') {
    resolution = Ref(refValue, node)
  } else if (isArray(refValue)) {
    const r = []
    refValue.forEach(ref => resolveAndLink(node, feature, ref, ::r.push))
    if (r.length > 0) { resolution = r }
  } else {
    resolveAndLink(node, feature, refValue, f => { resolution = f })
  }
  node[feature] = resolution

  // check resolved types
  if (node[feature] && !linkType(node[feature])) {
    appendError(node, createWrongTypeLinkageError(feature))
  }
}
const alreadyLinked = refValue => (
  isArray(refValue) ? forAll(refValue, alreadyLinked) : typeof refValue !== 'string'
)

const resolveAndLink = (node, feature, value, onResolved) => {
  const found = findInScope(node, value)
  if (found) {
    onResolved(Ref(value, found))
  } else {
    appendError(node, createUnresolvedLinkageError(feature, value))
  }
}