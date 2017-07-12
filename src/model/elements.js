import { Node } from './node'

export const Package = (name) => (...elements) => Node('Package')({ name, elements })
export const Class = (name) => (superclass = SuperType()(), ...mixins) => (...members) => Node('Class')({ name, superclass, mixins, members })
export const Mixin = (name) => (...members) => Node('Mixin')({ name, members })
export const Singleton = (name = undefined) => (superclass = SuperType()(), ...mixins) => (...members) => Node('NamedSingleton')({ name, superclass, mixins, members })

export const SuperType = (name = 'Object') => (...parameters) => Node('SuperType')({ name, parameters })