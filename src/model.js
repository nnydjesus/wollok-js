const Node = nodeType => body => ({ nodeType, ...body })

//-------------------------------------------------------------------------------------------------------------------------------
// FILE
//-------------------------------------------------------------------------------------------------------------------------------

export const File = (...content) => Node('File')({ content })
export const Import = (target) => Node('Import')({ target })
export const Program = (name) => (...sentences) => Node('Program')({ name, sentences })
export const Test = (description) => (...sentences) => Node('Program')({ description, sentences })

//-------------------------------------------------------------------------------------------------------------------------------
// LIBRARY ELEMENTS
//-------------------------------------------------------------------------------------------------------------------------------

export const Package = (name) => (...elements) => Node('Package')({ name, elements })
export const ClassDeclaration = (name) => (superclass = SuperType()(), ...mixins) => (...members) => Node('ClassDeclaration')({
  name,
  superclass,
  mixins,
  members
})
export const MixinDeclaration = (name) => (...members) => Node('MixinDeclaration')({ name, members })
export const ObjectDeclaration = (name = undefined) => (superclass = SuperType()(), ...mixins) => (...members) => Node('NamedObjectDeclaration')({
  name,
  superclass,
  mixins,
  members
})

//-------------------------------------------------------------------------------------------------------------------------------
// MEMBERS
//-------------------------------------------------------------------------------------------------------------------------------

export const VariableDeclaration = (variable, writeable = true, value = NullLiteral) => Node('VariableDeclaration')({ variable, writeable, value })
export const MethodDeclaration = (name, override = false, native = false) => (...parameters) => (...sentences) => Node('MethodDeclaration')({ name, override, native, parameters, sentences })
export const ConstructorDeclaration = (...parameters) => (baseTarget = SuperLiteral, baseArguments = []) => (...sentences) => Node('ConstructorDeclaration')({ baseTarget, baseArguments, parameters, sentences })

//-------------------------------------------------------------------------------------------------------------------------------
// SENTENCES
//-------------------------------------------------------------------------------------------------------------------------------

export const Assignment = (variable, value) => Node('Assignment')({ variable, value })

//-------------------------------------------------------------------------------------------------------------------------------
// EXPRESSIONS
//-------------------------------------------------------------------------------------------------------------------------------

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

//-------------------------------------------------------------------------------------------------------------------------------
// LITERALS
//-------------------------------------------------------------------------------------------------------------------------------

export const NullLiteral = Symbol('null')
export const SelfLiteral = Symbol('self')
export const SuperLiteral = Symbol('super')

export const BooleanLiteral = (value) => Node('BooleanLiteral')({ value })
export const NumberLiteral = (value) => Node('NumberLiteral')({ value })
export const StringLiteral = (value) => Node('StringLiteral')({ value })

export const SetLiteral = (...values) => Node('SetLiteral')({ values })
export const ListLiteral = (...values) => Node('ListLiteral')({ values })

export const Closure = (...parameters) => (...sentences) => Node('Closure')({ parameters, sentences })

//-------------------------------------------------------------------------------------------------------------------------------
// INNERS
//-------------------------------------------------------------------------------------------------------------------------------

export const Catch = (variable, type = null) => (...handler) => Node('Catch')({ variable, type, handler })
export const Parameter = (name, varArg = false) => Node('Param')({ name, varArg })
export const SuperType = (name) => (...parameters) => Node('SuperType')({ name, parameters })