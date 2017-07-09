import { Node } from './node'

export const Variable = (name) => Node('Variable')({ name })
export const BinaryOp = (op, left, right) => Node('BinaryOp')({ op, left, right })
export const UnaryOp = (op, exp) => Node('UnaryOp')({ op, exp })
export const InstanceOf = (left, right) => Node('InstanceOf')({ left, right })
export const FeatureCall = (target, key, nullSafe = false) => (...parameters) => Node('FeatureCall')({ target, key, nullSafe, parameters })
export const New = (target) => (...parameters) => Node('New')({ target, parameters })
export const Super = (...parameters) => Node('Super')({ parameters })
export const If = (condition) => (...thenSentences) => (...elseSentences) => Node('If')({ condition, thenSentences, elseSentences })
export const Try = (...sentences) => (...catches) => (...always) => Node('If')({ sentences, catches, always })
export const Throw = (exception) => Node('Throw')({ exception })
export const Return = (expression) => Node('Return')({ expression })