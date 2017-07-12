import { Node } from './node'
import { Literal } from './literals'
import { Block } from './inners'

export const Field = (variable, writeable = true, value = Literal(null)) => Node('Field')({ variable, writeable, value })
export const Method = (name, override = false, native = false) => (...parameters) => (...sentences) => Node('Method')({ name, override, native, parameters, sentences: Block(...sentences) })
export const Constructor = (...parameters) => (baseArguments = [], lookUpCall = true) => (...sentences) => Node('Constructor')({ parameters, sentences: Block(...sentences), lookUpCall, baseArguments })