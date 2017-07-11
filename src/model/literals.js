import { Node } from './node'

export const SelfLiteral = Node('SelfLiteral')({})
export const SuperLiteral = Node('SuperLiteral')({})

export const Literal = (value) => Node('Literal')({ value })

const ValuesLiteral = name => (...values) => Node(`${name}Literal`)({ values })
export const SetLiteral = ValuesLiteral('Set')
export const ListLiteral = ValuesLiteral('List')

export const Closure = (...parameters) => (...sentences) => Node('Closure')({ parameters, sentences })