{
  const path = require('path')
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
    InstanceOf,
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
    Variable,
    VariableDeclaration
  } = require(path.resolve('./src/model.js')) // THIS PATH HERE IS NOT GOOD, but pegjs sucks
}

DEFAULT = file

//-------------------------------------------------------------------------------------------------------------------------------
// BASICS
//-------------------------------------------------------------------------------------------------------------------------------

_ = blank:[ \t\r\n]* { return blank.join('') }
__ = blank:[ \t\r\n]+ { return blank.join('') }

id = h:'^'? c:[a-zA-Z_]cs:[a-zA-Z0-9_]* { return (h || '') + c + cs.join('') }
qualifiedName = root:id chain:('.' id)* { return [root, ...chain.map(([,name]) => name)].join('.') }

self = 'self' { return Variable('this') }
variable = name:id { return Variable(name) }

arguments = '(' _ args:(expression (_ ',' _ expression)* )? _ ')' { return args ? [args[0], ...args[1].map(([,,,arg])=>arg)] : [] }
parameters = '(' _ parameters: undelimitedParameters _ ')' { return parameters }
undelimitedParameters = params:(id (_ ',' _ id)* '...'?)? { return params ? [Parameter(params[0], !params[1].length && !!params[2]), ...params[1].map(([,,,param], i)=>Parameter(param, !!params[2] && i === params[1].length - 1))] : [] }

block = '{' _ sentences:sentence* _ '}' { return sentences }
blockOrSentence = block
                / sentence:sentence {return [sentence]}

//-------------------------------------------------------------------------------------------------------------------------------
// FILE
//-------------------------------------------------------------------------------------------------------------------------------

file = imports:import* _ elements:libraryElement* _ core:(main:program { return [main]} /test+)? _ { return File(...imports, ...elements, ...core||[]) }

import = 'import' __ name:qualifiedName all:('.*')? _ { return Import(name + (all||'')) }

program = _ 'program' __ name:id _ sentences:block _ { return Program(name)(...sentences) }

test = _ 'test' _ description:stringLiteral _ sentences:block _ { return Test(description)(...sentences) }


//-------------------------------------------------------------------------------------------------------------------------------
// LIBRARY ELEMENTS
//-------------------------------------------------------------------------------------------------------------------------------

libraryElement = element: (package / class / namedObject / mixin) _ { return element }

package = 'package' __ name:qualifiedName _ '{' _ elements:libraryElement* _ '}' { return Package(name)(...elements) }

class = 'class' __ name:id superclass:(_ 'inherits' __ qualifiedName)? mixins:mixinInclusion _ '{' _ members:(memberDeclaration/Constructor)* _ '}' { return Class(name)(superclass ? superclass[3] : 'Object',...mixins)(...members) }

mixin = 'mixin' __ name:id _ '{' _ members:memberDeclaration* _ '}' { return Mixin(name)(...members) }

namedObject = 'object' __ name:id superclass:(_ 'inherits' __ qualifiedName _ arguments?)? mixins:mixinInclusion _ '{' _ members:memberDeclaration* _ '}' { return Singleton(name)(superclass ? superclass[3] : undefined, superclass ? superclass[5] || undefined: undefined,...mixins)(...members) }

mixinInclusion = mixins:(_ 'mixed with' __ qualifiedName ((__'and'__/_','_) qualifiedName)* )? { return mixins ? [mixins[3], ...mixins[4].map(([,mixin])=>mixin)] : [] }

methodName = id / operator
methodBody = 'native'
           / block
           / '=' _ body:expression { return [body] }

//-------------------------------------------------------------------------------------------------------------------------------
// MEMBERS
//-------------------------------------------------------------------------------------------------------------------------------

memberDeclaration = member:(Field / Method) _ ';'? _ { return member }

Field = variable:variableDeclaration { return Field(variable.variable, variable.writeable, variable.value) }

Method = override:('override' __)? 'method' __ name:methodName _ parameters:parameters _ sentences:methodBody? { return Method(name, !!override, sentences === 'native')(...parameters)(...!sentences || sentences === 'native' ? [] : sentences) }

Constructor = 'constructor' _ parameters:parameters _ base:('=' _ ('self'/'super') _ arguments)? _ sentences:block? _ ';'? _ {return Constructor(...parameters)(base ? base[4] : [], !base || base[2] === 'super')(...sentences||[])}

//-------------------------------------------------------------------------------------------------------------------------------
// SENTENCES
//-------------------------------------------------------------------------------------------------------------------------------

sentence = _ sentence:( variableDeclaration / return / assignment / expression) _ ';'? _ { return sentence }

variableDeclaration = 'var' __ variable:variable _ value:variableInitialization? { return VariableDeclaration(variable, true, value || Literal(null)) }
                    / 'const' __ variable:variable _ value:variableInitialization { return VariableDeclaration(variable, false, value) }
variableInitialization = '=' _ value:expression { return value }

return = 'return' _ expression:expression { return Return(expression) }

assignment = left:variable _ '='    _ right:expression { return Assignment(left, right) }
           / left:variable _ '+='   _ right:expression { return Assignment(left, Send(left, '+'  )(right)) }
           / left:variable _ '-='   _ right:expression { return Assignment(left, Send(left, '-'  )(right)) }
           / left:variable _ '*='   _ right:expression { return Assignment(left, Send(left, '*'  )(right)) }
           / left:variable _ '/='   _ right:expression { return Assignment(left, Send(left, '/'  )(right)) }
           / left:variable _ '%='   _ right:expression { return Assignment(left, Send(left, '%'  )(right)) }
           / left:variable _ '<<='  _ right:expression { return Assignment(left, Send(left, '<<' )(right)) }
           / left:variable _ '>>='  _ right:expression { return Assignment(left, Send(left, '>>' )(right)) }
           / left:variable _ '>>>=' _ right:expression { return Assignment(left, Send(left, '>>>')(right)) }


//-------------------------------------------------------------------------------------------------------------------------------
// EXPRESSIONS
//-------------------------------------------------------------------------------------------------------------------------------

expression = orExpression

orExpression             = left:andExpression            tail:( _ orOp  _ andExpression           )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op)(right), left) }
andExpression            = left:equalityExpression       tail:( _ andOp _ equalityExpression      )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op)(right), left) }
equalityExpression       = left:orderExpression          tail:( _ eqOp  _ orderExpression         )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op)(right), left) }
orderExpression          = left:otherOpExpression _ 'instanceof' __ right:qualifiedName              { return InstanceOf(left, right) }
                         / left:otherOpExpression        tail:( _ ordOp _ otherOpExpression       )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op)(right), left) }
                          
otherOpExpression        = left:additiveExpression       tail:( _ otherOp _ additiveExpression    )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op)(right), left) }
additiveExpression       = left:multiplicativeExpression tail:( _ addOp _ multiplicativeExpression)* { return tail.reduce((prev, [,op,,right]) => Send(prev,op)(right), left) }
multiplicativeExpression = left:prefixUnaryExpression    tail:( _ mulOp _ prefixUnaryExpression   )* { return tail.reduce((prev, [,op,,right]) => Send(prev,op)(right), left) }
prefixUnaryExpression    = op:preOp _ exp:prefixUnaryExpression { return Send(exp,op+'_')() }
                         / postfixUnaryExpression
postfixUnaryExpression   = exp:Send op:postOp? { return op ? Send(exp,'_'+op)() : exp }
Send              = left:primaryExpression tail:(('.'/'?.') id (arguments/c:closure{return [c]}))* { return tail.reduce((target,[nullSafe,key,params])=> Send(target,key,nullSafe === '?.')(...params), left) }

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
                  / self
                  / variable
                  / '(' _ exp:expression _ ')' { return exp }

ifExpression = 'if' _ '(' _ condition:expression _ ')' _ thenS:blockOrSentence _ elseS:( _ 'else' _ blockOrSentence )? { return If(condition)(...thenS)(...elseS?elseS[3]:[]) }

tryExpression = 'try' _ body:blockOrSentence _ catches:catch* _ always:('then always' _ blockOrSentence)? { return Try(...body)(...catches)(...always?always[2]:[]) }
catch = _ 'catch' __ variable:variable _ type:(':' _ qualifiedName)? _ handler:blockOrSentence { return Catch(variable,type?type[2]:undefined)(...handler) }

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

stringLiteral = '"' value:( escapedChar  / [^'\\"] )* '"' { return Literal(value.join('')) }
              / "'" value:( escapedChar  / [^'\\'] )* "'" { return Literal(value.join('')) }
escapedChar = '\\b'/'\\t'/'\\n'/'\\f'/'\\r'/'\\u'/'\\"'/"\\'"/'\\\\'

numberLiteral = ('0x'/'0X') value:[0-9a-fA-F]+ { return Literal(parseInt(value.join(''), 16)) }
              / whole:[0-9]+'.'decimals:[0-9]+ { return Literal(parseFloat(whole.join('')+'.'+decimals.join(''))) }
              / value:[0-9]+                   { return Literal(parseInt(value.join(''), 10)) }

collectionLiteral =  '[' _ values:(expression (_ ',' _ expression)*)? _ ']' { return List(...values ? [values[0],...values[1].map( ([,,,elem]) => elem )] : []) }
                  / '#{' _ values:(expression (_ ',' _ expression)*)? _ '}' { return New('Set')(List(...values ? [values[0],...values[1].map( ([,,,elem]) => elem )] : [])) }

objectLiteral = 'object' superclass:(_ 'inherits' __ qualifiedName _ arguments?)? mixins:mixinInclusion _ '{' _ members:memberDeclaration* _ '}' { return Singleton()(superclass ? superclass[3] : undefined, superclass ? superclass[5] || undefined: undefined,...mixins)(...members) }

closure = '{' _ parameters:(undelimitedParameters _ '=>' _)? _ sentences:sentence* _ '}' {return Closure(...parameters?parameters[0]:[])(...sentences) }