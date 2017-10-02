{
  const path = require('path')
  let model
  try {
    model = require('./model.js')
  } catch(error) {
    model = require(path.resolve('./dist/model.js'))
  }

  const {
    Assignment,
    Catch,
    Class,
    Closure,
    Constructor,
    Send,
    Field,
    File,
    If,
    Import,
    List,
    Method,
    Mixin,
    New,
    Literal,
    Singleton,
    Package,
    Parameter,
    Program,
    Return,
    Super,
    SuperType,
    Test,
    Throw,
    Try,
    Reference,
    VariableDeclaration
  } = model
}

DEFAULT = file

//-------------------------------------------------------------------------------------------------------------------------------
// BASICS
//-------------------------------------------------------------------------------------------------------------------------------

_ = __? { return ' ' }
__ = ([ \t\r\n] / comment)+ { return ' ' }

comment = '/*' (!'*/' .)* '*/' _  { return '' }
        / '//' (!'\n' .)* '\n'? _ { return '' }

id = h:'^'? c:[a-zA-Z_]cs:[a-zA-Z0-9_]* { return (h || '') + c + cs.join('') }
qualifiedName = root:id chain:('.' id)* { return [root, ...chain.map(([,name]) => name)].join('.') }

reference = name:id { return Reference(name, location()) }

arguments = '(' _ args:(expression (_ ',' _ expression)* )? _ ')' { return args ? [args[0], ...args[1].map(([,,,arg])=>arg)] : [] }
parameters = '(' _ parameters: undelimitedParameters _ ')' { return parameters }
undelimitedParameters = params:(id (_ ',' _ id)* _ '...'?)? { return params ? [Parameter(params[0], !params[1].length && !!params[3], location()), ...params[1].map(([,,,param], i)=>Parameter(param, !!params[3] && i === params[1].length - 1, location()))] : [] }

block = '{' _ sentences:sentence* _ '}' { return sentences }
blockOrSentence = block
                / sentence:sentence {return [sentence]}

//-------------------------------------------------------------------------------------------------------------------------------
// FILE
//-------------------------------------------------------------------------------------------------------------------------------

file = _ imports:import* _ elements:libraryElement* _ core:(main:program { return [main]} /test+)? _ { return File(...imports, ...elements, ...core||[]) }

import = 'import' __ name:qualifiedName all:('.*')? _ { return Import(name + (all||''), location()) }

program = _ 'program' __ name:id _ sentences:block _ { return Program(name, location())(...sentences) }

test = _ 'test' _ description:stringLiteral _ sentences:block _ { return Test(description, location())(...sentences) }


//-------------------------------------------------------------------------------------------------------------------------------
// LIBRARY ELEMENTS
//-------------------------------------------------------------------------------------------------------------------------------

libraryElement = element: (package / class / namedObject / mixin) _ { return element }

package = 'package' __ name:qualifiedName _ '{' _ elements:libraryElement* _ '}' { return Package(name, location())(...elements) }

class = 'class' __ name:id superclass:(_ 'inherits' __ qualifiedName)? mixins:mixinInclusion _ '{' _ members:(memberDeclaration/constructor)* _ '}' { return Class(name, location())(superclass ? superclass[3] : undefined,...mixins)(...members) }

mixin = 'mixin' __ name:id _ '{' _ members:memberDeclaration* _ '}' { return Mixin(name, location())(...members) }

namedObject = 'object' __ name:id superclass:(_ 'inherits' __ qualifiedName _ arguments?)? mixins:mixinInclusion _ '{' _ members:memberDeclaration* _ '}' { return Singleton(name, location())(superclass ? superclass[3] : undefined, superclass ? superclass[5] || undefined: undefined,...mixins)(...members) }

mixinInclusion = mixins:(_ 'mixed with' __ qualifiedName ((__'and'__/_','_) qualifiedName)* )? { return mixins ? [mixins[3], ...mixins[4].map(([,mixin])=>mixin)] : [] }

methodName = id / operator
methodBody = 'native'
           / block
           / '=' _ body:expression { return [body] }

//-------------------------------------------------------------------------------------------------------------------------------
// MEMBERS
//-------------------------------------------------------------------------------------------------------------------------------

memberDeclaration = member:(field / method) _ ';'? _ { return member }

field = variable:variableDeclaration { return Field(variable.variable, variable.writeable, variable.value, location()) }

method = override:('override' __)? 'method' __ name:methodName _ parameters:parameters _ sentences:methodBody? { return Method(name, !!override, sentences === 'native', location())(...parameters)(...!sentences || sentences === 'native' ? [] : sentences) }

constructor = 'constructor' _ parameters:parameters _ base:('=' _ ('self'/'super') _ arguments)? _ sentences:block? _ ';'? _ {return Constructor(...parameters)(base ? base[4] : [], !base || base[2] === 'super', location())(...sentences||[])}

//-------------------------------------------------------------------------------------------------------------------------------
// SENTENCES
//-------------------------------------------------------------------------------------------------------------------------------

sentence = _ sentence:( variableDeclaration / return / assignment / expression) _ ';'? _ { return sentence }

variableDeclaration = mutable:('var'/'const') __ reference:reference _ value:variableInitialization? { return VariableDeclaration(reference, mutable === 'var', value || undefined, location()) }

variableInitialization = '=' _ value:expression { return value }

return = 'return' _ expression:expression { return Return(expression) }

assignment = left:reference _ '='    _ right:expression { return Assignment(left, right, location()) }
           / left:reference _ '+='   _ right:expression { return Assignment(left, Send(left, '+',   location())(right), location()) }
           / left:reference _ '-='   _ right:expression { return Assignment(left, Send(left, '-',   location())(right), location()) }
           / left:reference _ '*='   _ right:expression { return Assignment(left, Send(left, '*',   location())(right), location()) }
           / left:reference _ '/='   _ right:expression { return Assignment(left, Send(left, '/',   location())(right), location()) }
           / left:reference _ '%='   _ right:expression { return Assignment(left, Send(left, '%',   location())(right), location()) }
           / left:reference _ '<<='  _ right:expression { return Assignment(left, Send(left, '<<',  location())(right), location()) }
           / left:reference _ '>>='  _ right:expression { return Assignment(left, Send(left, '>>',  location())(right), location()) }
           / left:reference _ '>>>=' _ right:expression { return Assignment(left, Send(left, '>>>', location())(right), location()) }


//-------------------------------------------------------------------------------------------------------------------------------
// EXPRESSIONS
//-------------------------------------------------------------------------------------------------------------------------------

expression = orExpression

orExpression             = left:andExpression            tail:( _ orOp  _ andExpression           )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op, location())(right), left) }
andExpression            = left:equalityExpression       tail:( _ andOp _ equalityExpression      )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op, location())(right), left) }
equalityExpression       = left:orderExpression          tail:( _ eqOp  _ orderExpression         )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op, location())(right), left) }
orderExpression          = left:otherOpExpression        tail:( _ ordOp _ otherOpExpression       )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op, location())(right), left) }
otherOpExpression        = left:additiveExpression       tail:( _ otherOp _ additiveExpression    )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op, location())(right), left) }
additiveExpression       = left:multiplicativeExpression tail:( _ addOp _ multiplicativeExpression)* { return tail.reduce((prev, [,op,,right]) => Send(prev,op, location())(right), left) }
multiplicativeExpression = left:prefixUnaryExpression    tail:( _ mulOp _ prefixUnaryExpression   )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op, location())(right), left) }
prefixUnaryExpression    = op:preOp _ right:prefixUnaryExpression { return Send(right,op+'_', location())() }
                         / postfixUnaryExpression
postfixUnaryExpression   = left:reference op:postOp { return Assignment(left, Send(left,'_'+op, location())()) }
                         / send
send                     = left:primaryExpression tail:('.' id _ (arguments/c:closure{return [c]}))* { return tail.reduce((target,[,key,,params])=> Send(target,key, location())(...params), left) }


operator = orOp / andOp / eqOp / ordOp /otherOp / addOp / mulOp / preOp / postOp
orOp    = '||' / 'or'
andOp   = '&&' / 'and'
eqOp    = '===' / '!==' / '==' / '!='
ordOp   = '>=' / '<=' / '>' / '<'
otherOp = '..<' / '>..' / '..' / '->' / '>>>' / '>>' / '<<<' / '<<' / '<=>' / '<>' / '?:'
addOp   = '+' / '-'
mulOp   = '**' / '*' / '/' / '%'
preOp = 'not' / '!' / '-' / '+'
postOp  = '++' / '--'

primaryExpression = literal
                  / constructorCall
                  / superInvocation
                  / ifExpression
                  / tryExpression
                  / throwExpression
                  / reference
                  / '(' _ exp:expression _ ')' { return exp }

ifExpression = 'if' _ '(' _ condition:expression _ ')' _ thenS:blockOrSentence _ elseS:( _ 'else' _ blockOrSentence )? { return If(condition)(...thenS)(...elseS?elseS[3]:[]) }

tryExpression = 'try' _ body:blockOrSentence _ catches:catch* _ always:('then always' _ blockOrSentence)? { return Try(...body)(...catches)(...always?always[2]:[]) }
catch = _ 'catch' __ parameter:id _ type:(':' _ qualifiedName)? _ handler:blockOrSentence { return Catch(Parameter(parameter, false, location()),type?type[2]:undefined)(...handler) }

throwExpression = 'throw' _ exception:expression { return Throw(exception) }

superInvocation = 'super' _ args:arguments { return Super(...args) }

constructorCall = 'new' __ target:qualifiedName _ args:arguments { return New(target)(...args) }


//-------------------------------------------------------------------------------------------------------------------------------
// LITERALS
//-------------------------------------------------------------------------------------------------------------------------------

literal = booleanLiteral
        / numberLiteral
        / Literal
        / stringLiteral
        / objectLiteral
        / closure
        / collectionLiteral

booleanLiteral = value:('false' / 'true') { return Literal(value === 'true') }

Literal = 'null' { return Literal(null) }

stringLiteral = '"' value:( escapedChar  / [^"\\] )* '"' { return Literal(value.join('')) }
              / "'" value:( escapedChar  / [^'\\] )* "'" { return Literal(value.join('')) }
escapedChar = '\\b'/'\\t'/'\\n'/'\\f'/'\\r'/'\\u'/'\\"'/"\\'"/'\\\\'

numberLiteral = ('0x'/'0X') value:[0-9a-fA-F]+ { return Literal(parseInt(value.join(''), 16)) }
              / whole:[0-9]+'.'decimals:[0-9]+ { return Literal(parseFloat(whole.join('')+'.'+decimals.join(''))) }
              / value:[0-9]+                   { return Literal(parseInt(value.join(''), 10)) }

collectionLiteral =  '[' _ values:(expression (_ ',' _ expression)*)? _ ']' { return List(...values ? [values[0],...values[1].map( ([,,,elem]) => elem )] : []) }
                  / '#{' _ values:(expression (_ ',' _ expression)*)? _ '}' { return New('Set')(List(...values ? [values[0],...values[1].map( ([,,,elem]) => elem )] : [])) }

objectLiteral = 'object' superclass:(_ 'inherits' __ qualifiedName _ arguments?)? mixins:mixinInclusion _ '{' _ members:memberDeclaration* _ '}' { return Singleton(undefined, location())(superclass ? superclass[3] : undefined, superclass ? superclass[5] || undefined: undefined,...mixins)(...members) }

closure = '{' _ parameters:(undelimitedParameters _ '=>' _)? _ sentences:sentence* _ '}' {return Closure(...parameters?parameters[0]:[])(...sentences) }