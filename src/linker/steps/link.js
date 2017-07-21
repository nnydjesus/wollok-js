import winston from 'winston'
import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'
import { appendError, createUnresolvedLinkageError, createWrongTypeLinkageError } from '../errors'
import { isArray, forAll } from '../../utils/collections'
import { Node } from '../../model'

// winston.level = 'debug'

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

const link = (node, feature, linkType) => {
  const refValue = node[feature]

  if (alreadyLinked(refValue)) { return }
  // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
  if (refValue === 'Object') { return }

  // resolve and assign (and / or error)
  let resolution;
  if (isArray(refValue)) {
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
    onResolved(Ref(found))
  } else {
    appendError(node, createUnresolvedLinkageError(feature, value))
  }
}

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))