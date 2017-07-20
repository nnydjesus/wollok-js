import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'
import { array, isArray } from '../../utils/collections'
import { Node } from '../../model'

export const Ref = (node) => Node(Ref)({ node })

const isLinkeable = ({ type }) => linkeables[type]

export const linkStep = visit(filtering(isLinkeable, {
  exit(n) {
    const { type } = n
    array(linkeables[type]).forEach(feature => {
      link(n, feature)
    })
  }
}))

const link = (node, feature) => {
  const refValue = node[feature]

  // already linked
  if (typeof refValue !== 'string') { return }
  // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
  if (refValue === 'Object') { return; }

  const values = isArray(refValue) ? refValue : [refValue]
  values.forEach(ref => resolveAndLink(node, feature, ref))
}

const resolveAndLink = (n, feature, value) => {
  const found = findInScope(n, value)
  if (found) {
    n[feature] = Ref(found)
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