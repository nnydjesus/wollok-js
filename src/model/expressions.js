import { Node } from './node'
import { Block } from './inners'

export const Variable = (name) => Node('Variable')({ name })
export const BinaryOp = (op, left, right) => Node('BinaryOp')({ op, left, right })
export const UnaryOp = (op, target) => Node('UnaryOp')({ op, target })
export const InstanceOf = (left, right) => Node('InstanceOf')({ left, right })
export const FeatureCall = (target, key, nullSafe = false) => (...parameters) => Node('FeatureCall')({ target, key, nullSafe, parameters })
export const New = (target) => (...parameters) => Node('New')({ target, parameters })
export const Super = (...parameters) => Node('Super')({ parameters })
export const If = (condition) => (...thenSentences) => (...elseSentences) => Node('If')({ condition, thenSentences: Block(...thenSentences), elseSentences: Block(...elseSentences) })
export const Try = (...sentences) => (...catches) => (...always) => Node('Try')({ sentences: Block(...sentences), catches, always: Block(...always) })
export const Throw = (exception) => Node('Throw')({ exception })
