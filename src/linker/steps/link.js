import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables, isLinkeable } from '../definitions'
import { findInScope } from '../scoping'
import { createUnresolvedLinkageError, createWrongTypeLinkageError } from '../errors'
import { isArray, forAll } from '../../utils/collections'
import { node as Node } from '../../model'

// winston.level = 'debug'

export const Ref = (token, node) => Node(Ref)({ token, node })

export const linkStep = visit(filtering(isLinkeable, n => doLink(n, linkeables[n.type])))

const doLink = (node, linkDef) => Object.keys(linkDef)
  .reduce(
    (n, feature) => link(n, feature, linkDef[feature]),
    node
  )

const tempIgnore = ['Object', 'wollok.lang.Object', 'console', 'StringPrinter', 'wollok.lang.Exception', 'runtime', 'Exception']

const link = (node, feature, linkType) => {
  const refValue = node[feature]

  if (alreadyLinked(refValue)) { return node }
  // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
  if (tempIgnore.indexOf(refValue) >= 0) { return node }

  // resolve and assign (and / or error)
  const resolution = resolveLink(node, feature, refValue)
  // console.log('>>>>>> Resolution', resolution)
  return {
    ...node,
    // resolved
    ...resolution.resolved && {
      [feature]: resolution.target
    },
    // unresolved
    ...!resolution.resolved && {
      errors: [...(node.errors || []), createUnresolvedLinkageError(feature, refValue)]
    },
    // resolved but wrong type
    ...(resolution.resolved && !linkType(resolution.target)) && {
      errors: [...(node.errors || []), createWrongTypeLinkageError(feature, linkType, resolution.target)]
    }
  }
}

const alreadyLinked = refValue => (isArray(refValue) ? forAll(refValue, alreadyLinked) : typeof refValue !== 'string')
const resolveLink = (node, feature, refValue) => {
  if (refValue === 'self') {
    return {
      feature,
      resolved: true,
      target: Ref(refValue, node)
    }
  }
  // array references: needs to be improved (errors handling?)
  if (isArray(refValue)) {
    const arrayTarget = refValue.map(ref => resolveAndLink(node, feature, ref))
    return {
      feature,
      resolved: arrayTarget.every(r => r.resolved),
      target: arrayTarget.map(_ => _.target)
    }
  }
  // simple ref
  return resolveAndLink(node, feature, refValue)
}
const resolveAndLink = (node, feature, ref) => {
  const target = findInScope(node, ref)
  return {
    feature,
    resolved: !!target,
    target: Ref(ref, target)
  }
}
