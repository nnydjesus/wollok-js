import { flatten } from '../utils/collections'
import { collect } from '../visitors/commons'

export const LINKAGE_ERROR_TYPE = 'LINKAGE'

export const createUnresolvedLinkageError = (feature, ref) => ({
  errorType: LINKAGE_ERROR_TYPE,
  feature,
  ref,
  message: `Cannot resolve reference to '${ref}'`
})

export const createWrongTypeLinkageError = (feature) => ({
  errorType: LINKAGE_ERROR_TYPE,
  feature,
  // TODO: improve this message
  message: 'Referencing a wrong type'
})

export const appendError = (node, error) => {
  if (!node.errors) {
    node.errors = []
  }
  node.errors.push(error)
}

export const isLinkageError = error => error.errorType === LINKAGE_ERROR_TYPE

// retrieves a list of all errors in all nodes
// errors for the sake of tests are like this { ...error, node }
// so you can assert about the owner node
export const collectErrors = (node) => flatten(
  collect(node, n => (n.errors || [])
    .map(e => ({
      ...e,
      node: n,
    }))
  )).filter(isLinkageError)