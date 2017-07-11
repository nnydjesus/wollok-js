import { Node } from './node'
import { Literal } from './literals'

export const VariableDeclaration = (variable, writeable = true, value = Literal(null)) => Node('VariableDeclaration')({ variable, writeable, value })
export const Return = (result) => Node('Return')({ result })
export const Assignment = (variable, value) => Node('Assignment')({ variable, value })