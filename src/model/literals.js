import { Node } from './node'

export const NullLiteral = Symbol('null')
export const SelfLiteral = Symbol('self')
export const SuperLiteral = Symbol('super')

const ValueLiteral = name => value => Node(`${name}Literal`)({ value })
export const BooleanLiteral = ValueLiteral('Boolean')
export const NumberLiteral = ValueLiteral('Number')
export const StringLiteral = ValueLiteral('String')

const ValuesLiteral = name => (...values) => Node(`${name}Literal`)({ values })
export const SetLiteral = ValuesLiteral('Set')
export const ListLiteral = ValuesLiteral('List')

export const Closure = (...parameters) => (...sentences) => Node('Closure')({ parameters, sentences })