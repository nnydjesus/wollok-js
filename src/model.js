const Node = nodeType => body => ({ nodeType, ...body })

//-------------------------------------------------------------------------------------------------------------------------------
// TOP LEVEL
//-------------------------------------------------------------------------------------------------------------------------------

export const File = (...content) => Node('File')({ content })

export const Import = (target) => Node('Import')({ target })
export const Package = (name) => (...elements) => Node('Package')({ name, elements })

export const Class = (name) => (superclass = 'Object', ...mixins) => (...members) => Node('Class')({ name, superclass, mixins, members })
export const Mixin = (name) => (...members) => Node('Mixin')({ name, members })
export const Singleton = (name = undefined) => (superclass = SuperType()(), ...mixins) => (...members) => Node('NamedSingleton')({ name, superclass, mixins, members })

export const SuperType = (name = 'Object') => (...parameters) => Node('SuperType')({ name, parameters })

export const Program = (name) => (...sentences) => Node('Program')({ name, sentences: Block(...sentences) })
export const Test = (description) => (...sentences) => Node('Program')({ description, sentences: Block(...sentences) })

//-------------------------------------------------------------------------------------------------------------------------------
// MEMBERS
//-------------------------------------------------------------------------------------------------------------------------------

export const Field = (variable, writeable = true, value = Literal(null)) => Node('Field')({ variable, writeable, value })
export const Method = (name, override = false, native = false) => (...parameters) => (...sentences) => Node('Method')({ name, override, native, parameters, sentences: Block(...sentences) })
export const Constructor = (...parameters) => (baseArguments = [], lookUpCall = true) => (...sentences) => Node('Constructor')({ parameters, sentences: Block(...sentences), lookUpCall, baseArguments })

//-------------------------------------------------------------------------------------------------------------------------------
// SENTENCES
//-------------------------------------------------------------------------------------------------------------------------------

export const VariableDeclaration = (variable, writeable = true, value = Literal(null)) => Node('VariableDeclaration')({ variable, writeable, value })
export const Return = (result) => Node('Return')({ result })
export const Assignment = (variable, value) => Node('Assignment')({ variable, value })

//-------------------------------------------------------------------------------------------------------------------------------
// EXPRESSIONS
//-------------------------------------------------------------------------------------------------------------------------------

export const Variable = (name) => Node('Variable')({ name })
export const Literal = (value) => Node('Literal')({ value })
export const List = (...values) => Node('List')({ values })
export const Closure = (...parameters) => (...sentences) => Node('Closure')({ parameters, sentences: Block(...sentences) })

export const Send = (target, key, nullSafe = false) => (...parameters) => Node('Send')({ target, key, nullSafe, parameters })
export const Super = (...parameters) => Node('Super')({ parameters })

export const New = (target) => (...parameters) => Node('New')({ target, parameters })
export const InstanceOf = (left, right) => Node('InstanceOf')({ left, right })

export const If = (condition) => (...thenSentences) => (...elseSentences) => Node('If')({ condition, thenSentences: Block(...thenSentences), elseSentences: Block(...elseSentences) })
export const Throw = (exception) => Node('Throw')({ exception })
export const Try = (...sentences) => (...catches) => (...always) => Node('Try')({ sentences: Block(...sentences), catches, always: Block(...always) })
export const Catch = (variable, type) => (...handler) => Node('Catch')({ variable, type, handler: Block(...handler) })

//-------------------------------------------------------------------------------------------------------------------------------
// COMMONS
//-------------------------------------------------------------------------------------------------------------------------------

export const Parameter = (name, varArg = false) => Node('Param')({ name, varArg })

export const Block = (...sentences) => Node('Block')({ sentences })