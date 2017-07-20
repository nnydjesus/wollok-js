import winston from 'winston'
import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'
import { array, isArray, forAll } from '../../utils/collections'
import { Node } from '../../model'

winston.level = 'debug'

export const Ref = (node) => Node(Ref)({ node })

const isLinkeable = ({ type }) => linkeables[type]

export const linkStep = visit(filtering(isLinkeable, {
  exit(n) {
    const { type } = n
    doLink(n, linkeables[type])
  }
}))

const doLink = (node, linkDef) => Object.keys(linkDef).forEach(feature => {
  winston.debug(`Linking ${node.type}.${feature}`)
  link(node, feature, linkDef[feature])
})

// TODO: it should check the linked object with link type restriction.
/* eslint no-unused-vars:0 */
const link = (node, feature, linkType) => {
  const refValue = node[feature]

  // already linked
  if (alreadyLinked(refValue)) { return }
  // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
  if (refValue === 'Object') { return; }

  let resolution;
  if (isArray(refValue)) {
    resolution = []
    refValue.forEach(ref => resolveAndLink(node, feature, ref, ::resolution.push))
  } else {
    resolveAndLink(node, feature, refValue, f => { resolution = f })
  }
  node[feature] = resolution
}
const alreadyLinked = refValue => (
  isArray(refValue) ? forAll(refValue, alreadyLinked) : typeof refValue !== 'string'
)

const resolveAndLink = (n, feature, value, onResolved) => {
  const found = findInScope(n, value)
  if (found) {
    onResolved(Ref(found))
  } else {
    appendError(n, feature, value)
  }
}

export const LINKAGE_ERROR_TYPE = 'LINKAGE'

const appendError = (node, feature, ref) => {
  if (!node.errors) {
    node.errors = []
  }
  node.errors.push({
    errorType: LINKAGE_ERROR_TYPE,
    feature,
    ref,
    message: `Cannot resolve reference to '${ref}'`
  })
}

export const isLinkageError = error => error.errorType === LINKAGE_ERROR_TYPE

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))