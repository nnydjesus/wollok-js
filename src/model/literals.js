import { Node } from './node'
import { Block } from './inners'

export const SuperLiteral = Node('SuperLiteral')({})

export const Literal = (value) => Node('Literal')({ value })

const ValuesLiteral = name => (...values) => Node(`${name}Literal`)({ values })
export const SetLiteral = ValuesLiteral('Set')
export const ListLiteral = ValuesLiteral('List')

export const Closure = (...parameters) => (...sentences) => Node('Closure')({ parameters, sentences: Block(...sentences) })