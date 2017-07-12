import { Node } from './node'
import { Block } from './inners'

export const File = (...content) => Node('File')({ content })
export const Import = (target) => Node('Import')({ target })
export const Program = (name) => (...sentences) => Node('Program')({ name, sentences: Block(...sentences) })
export const Test = (description) => (...sentences) => Node('Program')({ description, sentences: Block(...sentences) })