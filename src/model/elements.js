import { Node } from './node'
import { SuperType } from './inners'

export const Package = (name) => (...elements) => Node('Package')({ name, elements })
export const ClassDeclaration = (name) => (superclass = SuperType()(), ...mixins) => (...members) => Node('ClassDeclaration')({ name, superclass, mixins, members })
export const MixinDeclaration = (name) => (...members) => Node('MixinDeclaration')({ name, members })
export const ObjectDeclaration = (name = undefined) => (superclass = SuperType()(), ...mixins) => (...members) => Node('NamedObjectDeclaration')({ name, superclass, mixins, members })