{
  const path = require('path')
  const {
    Assignment,
    BinaryOp,
    BooleanLiteral,
    Catch,
    ClassDeclaration,
    Closure,
    ConstructorDeclaration,
    FeatureCall,
    File,
    If,
    Import,
    InstanceOf,
    ListLiteral,
    MethodDeclaration,
    MixinDeclaration,
    New,
    NullLiteral,
    NumberLiteral,
    ObjectDeclaration,
    Package,
    Parameter,
    Program,
    Return,
    SelfLiteral,
    SetLiteral,
    StringLiteral,
    Super,
    SuperLiteral,
    SuperType,
    Test,
    Throw,
    Try,
    UnaryOp,
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

self = 'self' { return SelfLiteral }
super = 'super' { return SuperLiteral }
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

class = 'class' __ name:id superclass:inheritance mixins:mixinInclusion _ '{' _ members:(memberDeclaration/constructorDeclaration)* _ '}' { return ClassDeclaration(name)(superclass || undefined,...mixins)(...members) }

mixin = 'mixin' __ name:id _ '{' _ members:memberDeclaration* _ '}' { return MixinDeclaration(name)(...members) }

namedObject = 'object' __ name:id superclass:inheritance mixins:mixinInclusion _ '{' _ members:memberDeclaration* _ '}' { return ObjectDeclaration(name)(superclass || undefined,...mixins)(...members) }

inheritance = superclass:(_ 'inherits' __ qualifiedName _ arguments?)? { return superclass ? SuperType(superclass[3])(...superclass[5]||[]) : SuperType()() }

mixinInclusion = mixins:(_ 'mixed with' __ qualifiedName ((__'and'__/_','_) qualifiedName)* )? { return mixins ? [mixins[3], ...mixins[4].map(([,mixin])=>mixin)] : [] }

methodName = id / operator
methodBody = 'native'
           / block
           / '=' _ body:expression { return [body] }

//-------------------------------------------------------------------------------------------------------------------------------
// MEMBERS
//-------------------------------------------------------------------------------------------------------------------------------

memberDeclaration = member:(variableDeclaration / methodDeclaration) _ ';'? _ { return member }

variableDeclaration = 'var' __ variable:variable _ value:variableInitialization? { return VariableDeclaration(variable, true, value || NullLiteral) }
                    / 'const' __ variable:variable _ value:variableInitialization { return VariableDeclaration(variable, false, value) }
variableInitialization = '=' _ value:expression { return value }

methodDeclaration = override:('override' __)? 'method' __ name:methodName _ parameters:parameters _ sentences:methodBody? { return MethodDeclaration(name, !!override, sentences === 'native')(...parameters)(...!sentences || sentences === 'native' ? [] : sentences) }

constructorDeclaration = 'constructor' _ parameters:parameters _ base:('=' _ (self/super) _ arguments)? _ sentences:block? _ ';'? _ {return ConstructorDeclaration(...parameters)(base ? base[2] : undefined, base ? base[4] : undefined)(...sentences||[])}

//-------------------------------------------------------------------------------------------------------------------------------
// SENTENCES
//-------------------------------------------------------------------------------------------------------------------------------

sentence = _ sentence:( variableDeclaration / return / assignment / expression) _ ';'? _ { return sentence }

return = 'return' _ expression:expression { return Return(expression) }

assignment = left:variable _ '='    _ right:expression { return Assignment(left, right) }
           / left:variable _ '+='   _ right:expression { return Assignment(left, BinaryOp('+',   left, right)) }
           / left:variable _ '-='   _ right:expression { return Assignment(left, BinaryOp('-',   left, right)) }
           / left:variable _ '*='   _ right:expression { return Assignment(left, BinaryOp('*',   left, right)) }
           / left:variable _ '/='   _ right:expression { return Assignment(left, BinaryOp('/',   left, right)) }
           / left:variable _ '%='   _ right:expression { return Assignment(left, BinaryOp('%',   left, right)) }
           / left:variable _ '<<='  _ right:expression { return Assignment(left, BinaryOp('<<',  left, right)) }
           / left:variable _ '>>='  _ right:expression { return Assignment(left, BinaryOp('>>',  left, right)) }
           / left:variable _ '>>>=' _ right:expression { return Assignment(left, BinaryOp('>>>', left, right)) }


//-------------------------------------------------------------------------------------------------------------------------------
// EXPRESSIONS
//-------------------------------------------------------------------------------------------------------------------------------

expression = orExpression

orExpression             = left:andExpression            tail:( _ orOp  _ andExpression           )* { return tail.reduce((prev, [,op,,right]) => BinaryOp(op,prev,right), left) }
andExpression            = left:equalityExpression       tail:( _ andOp _ equalityExpression      )* { return tail.reduce((prev, [,op,,right]) => BinaryOp(op,prev,right), left) }
equalityExpression       = left:orderExpression          tail:( _ eqOp  _ orderExpression         )* { return tail.reduce((prev, [,op,,right]) => BinaryOp(op,prev,right), left) }
orderExpression          = left:otherOpExpression _ 'instanceof' __ right:qualifiedName              { return InstanceOf(left, right) }
                         / left:otherOpExpression        tail:( _ ordOp _ otherOpExpression       )* { return tail.reduce((prev, [,op,,right]) => BinaryOp(op,prev,right), left) }
                          
otherOpExpression        = left:additiveExpression       tail:( _ otherOp _ additiveExpression    )* { return tail.reduce((prev, [,op,,right]) => BinaryOp(op,prev,right), left) }
additiveExpression       = left:multiplicativeExpression tail:( _ addOp _ multiplicativeExpression)* { return tail.reduce((prev, [,op,,right]) => BinaryOp(op,prev,right), left) }
multiplicativeExpression = left:prefixUnaryExpression    tail:( _ mulOp _ prefixUnaryExpression   )* { return tail.reduce((prev, [,op,,right]) => BinaryOp(op,prev,right), left) }
prefixUnaryExpression    = op:preOp _ exp:prefixUnaryExpression { return UnaryOp(op, exp) }
                         / postfixUnaryExpression
postfixUnaryExpression   = exp:featureCall op:postOp? { return op ? UnaryOp(op, exp) : exp }
featureCall              = left:primaryExpression tail:(('.'/'?.') id (arguments/c:closure{return [c]}))* { return tail.reduce((target,[nullSafe,key,params])=> FeatureCall(target,key,nullSafe === '?.')(...params), left) }

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

superInvocation = super _ args:arguments { return Super(...args) }

constructorCall = 'new' __ target:qualifiedName _ args:arguments { return New(target)(...args) }


//-------------------------------------------------------------------------------------------------------------------------------
// LITERALS
//-------------------------------------------------------------------------------------------------------------------------------

literal = booleanLiteral
        / numberLiteral
        / nullLiteral
        / stringLiteral
        / objectLiteral
        / closure
        / collectionLiteral

booleanLiteral = value:('false' / 'true') { return BooleanLiteral(value === 'true') }

nullLiteral = 'null' { return NullLiteral }

stringLiteral = '"' value:( escapedChar  / [^'\\"] )* '"' { return StringLiteral(value.join('')) }
              / "'" value:( escapedChar  / [^'\\'] )* "'" { return StringLiteral(value.join('')) }
escapedChar = '\\b'/'\\t'/'\\n'/'\\f'/'\\r'/'\\u'/'\\"'/"\\'"/'\\\\'

numberLiteral = ('0x'/'0X') value:[0-9a-fA-F]+ { return NumberLiteral(parseInt(value.join(''), 16)) }
              / whole:[0-9]+'.'decimals:[0-9]+ { return NumberLiteral(parseFloat(whole.join('')+'.'+decimals.join(''))) }
              / value:[0-9]+                   { return NumberLiteral(parseInt(value.join(''), 10)) }

collectionLiteral =  '[' _ values:(expression (_ ',' _ expression)*)? _ ']' { return ListLiteral(...values ? [values[0],...values[1].map( ([,,,elem]) => elem )] : []) }
                  / '#{' _ values:(expression (_ ',' _ expression)*)? _ '}' { return SetLiteral(...values ? [values[0],...values[1].map( ([,,,elem]) => elem )] : []) }

objectLiteral = 'object' superclass:inheritance mixins:mixinInclusion _ '{' _ members:memberDeclaration* _ '}' { return ObjectDeclaration()(superclass || undefined,...mixins)(...members) }

closure = '{' _ parameters:(undelimitedParameters _ '=>' _)? _ sentences:sentence* _ '}' {return Closure(...parameters?parameters[0]:[])(...sentences) }