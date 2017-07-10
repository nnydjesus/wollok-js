import { Node } from './node'

export const Return = (result) => Node('Return')({ result })
export const Assignment = (variable, value) => Node('Assignment')({ variable, value })

export const Parameter = (name, varArg = false) => Node('Param')({ name, varArg })