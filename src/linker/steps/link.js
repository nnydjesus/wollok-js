import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'
import { array, isArray } from '../../utils/collections'

const isLinkeable = ({ type }) => linkeables[type]

export const linkStep = (node) => {
  visit(node, filtering(isLinkeable, {
    exit(n) {
      const { type } = n
      array(linkeables[type]).forEach(feature => {
        link(n, feature)
      })
    }
  }))
  return node
}

const link = (node, feature) => {
  const refValue = node[feature]
  // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
  if (refValue === 'Object') {
    return;
  }
  const values = isArray(refValue) ? refValue : [refValue]

  values.forEach(ref => resolveAndLink(node, feature, ref))
}

const resolveAndLink = (n, feature, value) => {
  const found = findInScope(n, value)
  if (found) {
    // TODO: set it in the same "feature" attribute (currently causes cyclic)
    // n[feature] = found
    n.link = found
  } else {
    appendError(n, feature, value)
  }
}

export const LINKAGE_ERROR_TYPE = 'LINKAGE'

const appendError = (node, feature, ref) => {
  if (!node.errors) {
    node.errors = []
  }
  node.errors.push({ errorType: LINKAGE_ERROR_TYPE, feature, ref })
}

export const isLinkageError = error => error.errorType === LINKAGE_ERROR_TYPE

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))