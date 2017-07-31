import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables, isLinkeable } from '../definitions'
import { findInScope } from '../scoping'
import { createUnresolvedLinkageError } from '../errors'
import { isArray, forAll } from '../../utils/collections'
import { node as Node } from '../../model'

// winston.level = 'debug'

export const Link = (parent, token, path) => Node('Link')({ parent, token, path })

export const linkStep = visit(filtering(isLinkeable, n => doLink(n, linkeables[n.type])))

const doLink = (node, linkDef) => Object.keys(linkDef)
  .reduce(
    (n, feature) => link(n, feature, linkDef[feature]),
    node
  )

const tempIgnore = ['Object', 'wollok.lang.Object', 'console', 'StringPrinter', 'wollok.lang.Exception', 'runtime', 'Exception']

const link = (node, feature) => {
  const refValue = node[feature]

  if (alreadyLinked(refValue)) { return node }
  // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
  if (tempIgnore.indexOf(refValue) >= 0) { return node }

  const resolution = resolveLink(node, feature, refValue)
  return {
    ...node,
    // resolved
    ...resolution.resolved && {
      [feature]: resolution.link
    },
    // unresolved
    ...!resolution.resolved && {
      errors: [...(node.errors || []), createUnresolvedLinkageError(feature, refValue)]
    },
    // resolved but wrong type
    // ...(resolution.resolved && !linkType(resolution.link)) && {
    //   errors: [...(node.errors || []), createWrongTypeLinkageError(feature, linkType, resolution.link)]
    // }
  }
}

const alreadyLinked = refValue => (isArray(refValue) ? forAll(refValue, alreadyLinked) : typeof refValue !== 'string')
const resolveLink = (node, feature, refValue) => {
  if (refValue === 'self') {
    return {
      feature,
      resolved: true,
      link: Link(node, refValue, node.path)
    }
  }
  // array references: needs to be improved (errors handling?)
  if (isArray(refValue)) {
    const arrayTarget = refValue.map(ref => resolveAndLink(node, feature, ref))
    return {
      feature,
      resolved: arrayTarget.every(r => r.resolved),
      link: arrayTarget.map(_ => _.link)
    }
  }
  // simple ref
  return resolveAndLink(node, feature, refValue)
}
const resolveAndLink = (node, feature, ref) => {
  const targetPath = findInScope(node, ref)
  return {
    feature,
    resolved: !!targetPath,
    link: Link(node, ref, targetPath)
  }
}
