import { File, Class, Field, Method, Closure, Block, Mixin, Parameter, Module, VariableDeclaration } from '../model'
import { a, many, or } from './types'

// This declarations are not the best and most intuitive form, but
// the minimum to add new cases already understandables by the current linker impl
// I know that it is not yet close to the "final version" or "the best way
//  to express links rules", but I'm iterating over it trying to understand the underlying model
//  based on needs.

/* nodes that define new scopes/namespaces */
export const scopes = {
  [File]: _ => _.content,
  [Module]: _ => _.members.filter(m => m.is(Field)),
  [Method]: _ => _.parameters,
  [Closure]: _ => _.parameters,
  [Block]: _ => _.sentences.filter(s => s.is(VariableDeclaration))
}

const byName = n => n.name
/* nodes which gets registered in their parent's scope */
export const referenciables = {
  [VariableDeclaration]: _ => byName(_.variable),
  [Field]: _ => byName(_.variable),
  [Parameter]: byName,
  [Module]: byName,
}

export const linkeables = {
  Reference: { name: or([Field, VariableDeclaration, Parameter]) },
  New: { target: a(Class) },
  Class: {
    superclass: a(Class),
    mixins: many(Mixin)
  }
}

// TODO: use findValueByType(linkeables, type) and dispatch
export const isLinkeable = ({ type }) => linkeables[type]
