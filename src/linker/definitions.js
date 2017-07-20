import { isArray, forAll, anySatisfy } from '../utils/collections'
import { Field, VariableDeclaration, Parameter, Block, Program, File, Class, Method, Closure, Singleton, Mixin } from '../model'

// This declarations are not the best and most intuitive form, but
// the minimum to add new cases already understandables by the current linker impl
// I know that it is not yet close to the "final version" or "the best way
//  to express links rules", but I'm iterating over it trying to understand the underlying model
//  based on needs.

/* nodes that define new scopes/namespaces */
const scopeables = [
  File,
  Program,
  Class,
  Singleton,
  Method,
  Mixin,
  Closure,
  Block
].map(_ => _.name)
export const isScopeable = type => scopeables.includes(type)

const byName = n => n.name
/* nodes which gets registered in their parent's scope */
export const referenciables = {
  [VariableDeclaration.name]: _ => byName(_.variable),
  [Field.name]: _ => byName(_.variable),
  [Parameter.name]: byName,
  [Class.name]: byName,
  [Mixin.name]: byName,
  [Singleton.name]: byName
}

// link type restrictions (validates Ref(node) or [Ref])
export const a = type => ({ node }) => node.type === type.name
export const many = type => values => isArray(values) && forAll(values, ref => a(type)(ref))
export const or = (types) => ref => anySatisfy(types, type => a(type)(ref))

export const linkeables = {
  Variable: { name: or([Field, VariableDeclaration, Parameter]) },
  New: { target: a(Class) },
  Class: {
    superclass: a(Class),
    mixins: many(Mixin)
  }
}
