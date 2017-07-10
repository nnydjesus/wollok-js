import log from 'color-log'
import {
  Assignment,
  BinaryOp,
  BooleanLiteral,
  Catch,
  ClassDeclaration,
  Closure,
  ConstructorDeclaration,
  FeatureCall,
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
} from './model'

// This interpreter compiles the AST to a string representing JS code and then evals it.
// I know, I know... But this is not meant to be nice or final code. Just a quick rough approach to get a better feeling on the AST shape.

const compileSentence = (sentence) => {
  if(sentence.nodeType === 'VariableDeclaration') {
    const { variable, writeable, value } = sentence
    return ` ${writeable ? 'let' : 'const'} ${variable.name} = ${compileExpression(value)} ;`
  }
  if(sentence.nodeType === 'Assignment') {
    const { variable, value } = sentence
    return ` ${variable.name} = ${compileExpression(value)} ;`
  }

  return compileExpression(sentence) + ';'
}


const compileExpression = (expression) => {
  if(expression.nodeType === 'Variable') {
    const { name } = expression
    return ` ${name} `
  }
  
  if(expression.nodeType === 'BinaryOp') {
    const { op, left, right } = expression
    const leftOperand = compileExpression(left)
    const rightOperand = compileExpression(right)

    switch(op) { //TODO: Other Ops: '..<' / '>..' / '..' / '->' / '>>>' / '>>' / '<<<' / '<<' / '<=>' / '<>' / '?:'
      case 'or' : return `(${leftOperand} || ${rightOperand})`
      case 'and': return `(${leftOperand} && ${rightOperand})`
      case '===': return `Object.is(${leftOperand},${rightOperand})`
      case '!==': return `!Object.is(${leftOperand},${rightOperand})`
      case '==' : return `(${leftOperand} === ${rightOperand})`
      case '!=' : return `(${leftOperand} !== ${rightOperand})`
      case '**' : return `Math.pow(${leftOperand},${rightOperand})`
      case '||' :
      case '&&' :
      case '>=' :
      case '<=' :
      case '>'  :
      case '<'  :
      case '+'  :
      case '-'  :
      case '*'  :
      case '/'  :
      case '%'  : return `(${leftOperand} ${op} ${rightOperand})`
    }

  }
  
  if(expression.nodeType === 'UnaryOp') {
    const { op, target } = expression
    const operand = compileExpression(target)

    switch(op) {
      case 'not':
      case '!'  : return `!${operand}`
      case '-'  : return `-${operand}`
      case '++' : return `${operand}++`
      case '--' : return `${operand}--`
      //case '+': TODO: WTF does this do?
    }
  }
  
  if(expression.nodeType === 'InstanceOf') {
    const { left, right } = expression
    //TODO
  }
  
  if(expression.nodeType === 'FeatureCall') { //TODO: nullSafe
    const { target, key, nullSafe, parameters } = expression
    return `${compileExpression(target)}["${key}"](${parameters.map(compileExpression).join()})`
  }
  
  if(expression.nodeType === 'New') {
    const { target, parameters } = expression
    //TODO
  }
  
  if(expression.nodeType === 'Super') {
    const { parameters } = expression
    //TODO
  }
  
  if(expression.nodeType === 'If') {
    const { condition, thenSentences, elseSentences } = expression
    return `(()=>{if(${compileExpression(condition)}){${ compileSentenceSequence(thenSentences) }}else{${ compileSentenceSequence(elseSentences) }}})()`
  }
  
  if(expression.nodeType === 'Try') {
    const { sentences, catches, always } = expression

    const handlers = catches.map(({variable, type, handler}) => {
      const evaluation = `const ${variable.name} = ___ERROR___;${compileSentenceSequence(handler)}`
      return type ? `if(___ERROR___ instanceof ${type}){${evaluation}}` : evaluation
    })

    const catchBlock = catches.length ? `catch(___ERROR___){${handlers.join(';')} throw ___ERROR___}` : ''
    const alwaysBlock = always.length ? `finally{${compileSentenceSequence(always)}}` : ''

    return `(()=>{try{${compileSentenceSequence(sentences)}}${catchBlock}${alwaysBlock}})()`
  }

  if(expression.nodeType === 'Throw') {
    const { exception } = expression
    return `(()=>{throw ${compileExpression(exception)}})()`
  }

  if(expression.nodeType === 'Return') {
    const { result } = expression
    return `return ${compileExpression(result)}`
  }

  return compileLiteral(expression)
}


const compileLiteral = (literal) => {
  if(literal.nodeType === 'NullLiteral') {
    return `null`
  }

  if(literal.nodeType === 'SelfLiteral') {
    return `this`
  }

  if(literal.nodeType === 'BooleanLiteral') {
    const { value } = literal
    return `${value}`
  }
 
  if(literal.nodeType === 'NumberLiteral') {
    const { value } = literal
    return `${value}`
  }
 
  if(literal.nodeType === 'StringLiteral') {
    const { value } = literal
    return `"${value}"`
  }
 
  if(literal.nodeType === 'SetLiteral') {
    const { values } = literal
    return `new Set([ ${values.map(compileExpression).join() } ])`
  }
 
  if(literal.nodeType === 'ListLiteral') {
    const { values } = literal
    return `[ ${values.map(compileExpression).join() } ]`
  }
 
  if(literal.nodeType === 'Closure') {
    const { parameters, sentences } = literal
    const compiledSentences = sentences.map(compileSentence)
    if(compiledSentences.length) compiledSentences[compiledSentences.length - 1] = 'return ' + compiledSentences[compiledSentences.length - 1]

    return `(function (${ parameters.map(compileParameter).join() }) {${ compileSentenceSequence(sentences) }})`
  }
}

// TODO: Handle mixin inclusion
const compileElement = (element) => {

  if(element.nodeType === 'Package') {
    const { name, elements } = element
    //TODO
  }

  if(element.nodeType === 'ClassDeclaration') {
    const { name, superclass, mixins, members } = element
    const constructorDeclaration = compileConstructor(
      members.filter(m => m.nodeType === 'VariableDeclaration' && m.value),
      members.filter(m => m.nodeType === 'ConstructorDeclaration')
    )
    const memberDeclarations = members
      .filter(m => m.nodeType !== 'ConstructorDeclaration')
      .map(compileMember)
      .join(';')

    return `class ${name} extends ${superclass.name} { ${constructorDeclaration} ${memberDeclarations} }`
  }

  if(element.nodeType === 'MixinDeclaration') {
    const { name, members } = element
    //TODO
  }

  if(element.nodeType === 'ObjectDeclaration') {
    const { name, superclass, mixins, members } = element
    return `const ${name} = new class extends ${superclass.name}{
      constructor(){super(${superclass.parameters.map(compileExpression).join()})};${members.map(compileMember).join(';')}
    };`
  }

}

const compileMember = (member) => {
  if(member.nodeType === 'VariableDeclaration'){
    const { variable, writeable, value } = member
    const getter = `get ['${variable.name}']() {return this['___${variable.name}___']}`
    const setter = `set ['${variable.name}'](___value___) {this['___${variable.name}___'] = ___value___}`
  }
  
  if(member.nodeType === 'MethodDeclaration') { //TODO: override? Native?
    const { name, override, native, parameters, sentences } = member
    return `['${name}'](${parameters.map(compileParameter).join(',')}){${compileSentenceSequence(sentences)}}`
  }
}

const compileConstructor = (constructors, variableDeclarations) => {

  const constructorFunctions = constructors.map(({ parameters, sentences, baseTarget, baseArguments }) =>
    `___cons___[${baseArguments.length}] = (${parameters.map(compileParameter).join(',')}) => {
      ${baseTarget === SelfLiteral ? `___cons___['${baseArguments.length}']` : 'super'}(${baseArguments.map(compileParameter).join(',')});
      ${compileSentenceSequence(sentences)}
    }`
  )
  
  return `constructor(...___args___){___cons___ = {};${constructorFunctions.join(';')}; ___cons___[___args___.length](...___args___)}`
}  

const compileParameter = ({name, varArg}) => varArg ? '...' + name : name

const compileSentenceSequence = (sentences) => {
  const compiledSentences = sentences.map(compileSentence)
  if(compiledSentences.length && !compiledSentences[compiledSentences.length - 1].startsWith('return'))
    compiledSentences[compiledSentences.length - 1] = 'return ' + compiledSentences[compiledSentences.length - 1]
  return compiledSentences.join('')
}



export const interpretSentence = (ast) => eval(compileSentence(ast))
export const interpretElement = (ast) => eval(compileElement(ast))

export default (ast) => null//TODO: interpretFile
