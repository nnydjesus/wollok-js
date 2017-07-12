import { Node } from './node'
import { Block } from './inners'

export const Variable = (name) => Node('Variable')({ name })
export const InstanceOf = (left, right) => Node('InstanceOf')({ left, right })
export const Send = (target, key, nullSafe = false) => (...parameters) => Node('Send')({ target, key, nullSafe, parameters })
export const New = (target) => (...parameters) => Node('New')({ target, parameters })
export const Super = (...parameters) => Node('Super')({ parameters })
export const If = (condition) => (...thenSentences) => (...elseSentences) => Node('If')({ condition, thenSentences: Block(...thenSentences), elseSentences: Block(...elseSentences) })
export const Try = (...sentences) => (...catches) => (...always) => Node('Try')({ sentences: Block(...sentences), catches, always: Block(...always) })
export const Throw = (exception) => Node('Throw')({ exception })
