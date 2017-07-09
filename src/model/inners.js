import { Node } from './node'

export const Assignment = (variable, value) => Node('Assignment')({ variable, value })

export const Catch = (variable, type = null) => (...handler) => Node('Catch')({ variable, type, handler })
export const Parameter = (name, varArg = false) => Node('Param')({ name, varArg })
export const SuperType = (name) => (...parameters) => Node('SuperType')({ name, parameters })