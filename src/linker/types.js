import { isArray, forAll, anySatisfy } from '../utils/collections'

// link type restrictions (validates Ref(node) or [Ref])
export const a = type => ({ node }) => node.type === type.name
export const many = type => values => isArray(values) && forAll(values, ref => a(type)(ref))
export const or = (types) => ref => anySatisfy(types, type => a(type)(ref))