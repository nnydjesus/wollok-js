import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'

const isLinkeable = ({ type }) => linkeables[type]

export const linkStep = (node) => {
  visit(node, filtering(isLinkeable, {
    enter(n) {
      const { type } = n
      const name = linkeables[type](n)
      // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
      if (name !== 'Object') {
        resolveAndLink(n, name)
      }
    }
  }))
  return node
}

const resolveAndLink = (n, name) => {
  const found = findInScope(n, name)
  if (found) {
    n.link = found
  } else {
    appendError(n, name)
  }
}

export const LINKAGE_ERROR_TYPE = 'LINKAGE'

const appendError = (node, ref) => {
  if (!node.errors) {
    node.errors = []
  }
  node.errors.push({ errorType: LINKAGE_ERROR_TYPE, ref })
}

export const isLinkageError = error => error.errorType === LINKAGE_ERROR_TYPE

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))