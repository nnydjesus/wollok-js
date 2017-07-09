import { Node } from './node'
import { NullLiteral, SuperLiteral } from './literals'

export const VariableDeclaration = (variable, writeable = true, value = NullLiteral) => Node('VariableDeclaration')({ variable, writeable, value })
export const MethodDeclaration = (name, override = false, native = false) => (...parameters) => (...sentences) => Node('MethodDeclaration')({ name, override, native, parameters, sentences })
export const ConstructorDeclaration = (...parameters) => (baseTarget = SuperLiteral, baseArguments = []) => (...sentences) => Node('ConstructorDeclaration')({ parameters, sentences })