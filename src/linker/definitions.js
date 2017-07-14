import { Variable, New, Field, VariableDeclaration, Parameter, Block, Program, File, Class, Method, Closure, Singleton, Mixin } from '../model'

// This declarations are not the best and most intuitive form, but
// the minimum to add new cases already understandables by the curren linker impl
// I know that it is not yet close to the "final version" or "the best way
//  to express links rules", but I'm iterating over it trying to understand the underlying model
//  based on needs.


/* nodes that define new scopes/namespaces */
const scopeables = [
  File.name,
  Program.name,
  Class.name,
  Singleton.name,
  Method.name,
  Mixin.name,
  Closure.name,
  Block.name
]
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

/** 
 * TODO: what should be linked are not whole nodes but some attribute of them
 * For example Class.superclass and Class.mixins
 * This should exppress that !
 */

// links({
//   Class: {
//     superclass: Class,
//     mixins: many(Mixin)
//   },
//   // 2 things here:
//          1) the whole node gets replaced by the reference. 
//          2) could be a ref to many thinks: Param | VariableDeclaration, for example
//   Variable: Referenciable 
// })

export const linkeables = {
  [Variable.name]: v => v.name,
  [New.name]: n => n.target,
  [Class.name]: c => c.superclass
}
