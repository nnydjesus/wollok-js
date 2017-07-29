import { isArray, forAll } from '../utils/collections'

const { assign } = Object

// link type restrictions (validates Ref(node) or [Ref])
export const a = type => functionWithToString(
  ({ node }) => node.type === type.name,
  () => `a ${type}`
)
export const many = type => functionWithToString(
  values => isArray(values) && forAll(values, ref => a(type)(ref)),
  () => `[${type}]`
)
export const or = types => functionWithToString(
  ref => types.some(type => a(type)(ref)),
  () => types.join('|')
)

const functionWithToString = (fn, toString) => assign(fn, { toString })