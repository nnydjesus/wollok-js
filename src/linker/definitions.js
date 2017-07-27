import { Block, Class, Closure, Field, File, Method, Mixin, Parameter, Singleton, VariableDeclaration } from '../model'
import { a, many, or } from './types'

// This declarations are not the best and most intuitive form, but
// the minimum to add new cases already understandables by the current linker impl
// I know that it is not yet close to the "final version" or "the best way
//  to express links rules", but I'm iterating over it trying to understand the underlying model
//  based on needs.

/* nodes that define new scopes/namespaces */
const scopeables = [
  File,
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

export const linkeables = {
  Reference: { name: or([Field, VariableDeclaration, Parameter]) },
  New: { target: a(Class) },
  Class: {
    superclass: a(Class),
    mixins: many(Mixin)
  }
}
