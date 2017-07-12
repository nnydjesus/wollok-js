import { Node } from './node'

export const Catch = (variable, type) => (...handler) => Node('Catch')({ variable, type, handler: Block(...handler) })
export const Parameter = (name, varArg = false) => Node('Param')({ name, varArg })
export const Block = (...sentences) => Node('Block')({ sentences })