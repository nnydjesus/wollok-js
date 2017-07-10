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
  switch (sentence.nodeType) {
    case 'VariableDeclaration': {
      const { variable, writeable, value } = sentence
      return ` ${writeable ? 'let' : 'const'} ${variable.name} = ${compileExpression(value)} ;`
    }
    case 'Assignment': {
      const { variable, value } = sentence
      return ` ${variable.name} = ${compileExpression(value)} ;`
    }
    default: return `${compileExpression(sentence)};`
  }
}


const compileExpression = (expression) => {
  // generic dispatch
  const methodName = `compile${expression.nodeType}`
  if (compiler[methodName]) {
    return compiler[methodName](expression)
  }
}

// we can eventually move this out to a 
const compiler = {

  // **********************
  // ** elements
  // **********************

  compilePackage: ({ name, elements }) => {
    // TODO
  },

  compileClassDeclaration: ({ name, superclass, mixins, members }) => {
    const constructorDeclaration = compileConstructor(
      members.filter(m => m.nodeType === 'VariableDeclaration' && m.value),
      members.filter(m => m.nodeType === 'ConstructorDeclaration')
    )
    const memberDeclarations = members
      .filter(m => m.nodeType !== 'ConstructorDeclaration')
      .map(compileMember)
      .join(';')

    return `class ${name} extends ${superclass.name} { ${constructorDeclaration} ${memberDeclarations} }`
  },

  compileMixinDeclaration: ({ name, members }) => {
    // TODO
  },

  compileObjectDeclaration: ({ name, superclass, mixins, members }) => 
    `const ${name} = new class extends ${superclass.name}{
      constructor(){super(${superclass.compileArguments(parameters)})};${members.map(compileMember).join(';')}
    };`,

  // **********************
  // ** expressions
  // **********************

  compileVariable: ({ name }) => ` ${name} `,

  compileBinaryOp: ({ op, left, right }) => {
    const leftOperand = compileExpression(left)
    const rightOperand = compileExpression(right)

    switch(op) { // TODO: Other Ops: '..<' / '>..' / '..' / '->' / '>>>' / '>>' / '<<<' / '<<' / '<=>' / '<>' / '?:'
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
  },

  compileUnaryOp: ({ op, target }) => {
    const operand = compileExpression(target)
    switch (op) {
      case 'not':
      case '!' : return `!${operand}`
      case '-' : return `-${operand}`
      case '++' : return `${operand}++`
      case '--' : return `${operand}--`
      // case '+': TODO: WTF does this do?
    }
  },

  //

  compileInstanceOf: ({ left, right }) => `${compileExpression(left)} instanceof ${right}`,

  compileFeatureCall: ({ target, key, nullSafe, parameters }) => `${compileExpression(target)}["${key}"](${compileArguments(parameters)})`,

  compileNew: ({ target, parameters }) => `new ${target}(${compileArguments(parameters)})`,
  compileSuper: ({ parameters }) => `super(${compileArguments(parameters)})`,

  // flow control

  compileIf: ({ condition, thenSentences, elseSentences }) => 
    `(() => { if (${compileExpression(condition)}) {${compileSentenceSequence(thenSentences)}} else {${compileSentenceSequence(elseSentences)}}})()`,

  compileReturn: ({ result }) => `return ${compileExpression(result)}`,
  compileThrow: ({ exception }) => `(() => { throw ${compileExpression(exception)} })()`,
  
  compileTry: ({ sentences, catches, always }) => {
    const handlers = catches.map(({variable, type, handler}) => {
      const evaluation = `const ${variable.name} = ___ERROR___;${compileSentenceSequence(handler)}`
      return type ? `if (___ERROR___ instanceof ${type}){${evaluation}}` : evaluation
    })

    const catchBlock = catches.length ? `catch(___ERROR___){${handlers.join(';')} throw ___ERROR___}` : ''
    const alwaysBlock = always.length ? `finally{${compileSentenceSequence(always)}}` : ''

    return `(()=>{try{${compileSentenceSequence(sentences)}}${catchBlock}${alwaysBlock}})()`
  },

  // literals

  compileNullLiteral: () => 'null',
  compileSelfLiteral: () => 'this',

  compileBooleanLiteral: ({ value }) => `${value}`,
  compileNumberLiteral: ({ value }) => `${value}`,
  compileStringLiteral: ({ value }) => `"${value}"`,

  compileSetLiteral: ({ values }) => `new Set([ ${values.map(compileExpression).join()} ])`,

  compileListLiteral: ({ values }) => `[ ${values.map(compileExpression).join()} ]`,

  compileClosure: ({ parameters, sentences }) => {
    const compiledSentences = sentences.map(compileSentence)
    if (compiledSentences.length) compiledSentences[compiledSentences.length - 1] = `return ${compiledSentences[compiledSentences.length - 1]}`

    return `(function (${compileParameters(parameters)}) {${compileSentenceSequence(sentences)}})`
  }
}

// TODO: Handle mixin inclusion


const compileMember = (member) => {
  if (member.nodeType === 'VariableDeclaration') {
    const { variable, writeable, value } = member
    const getter = `get ['${variable.name}']() {return this['___${variable.name}___']}`
    const setter = `set ['${variable.name}'](___value___) {this['___${variable.name}___'] = ___value___}`
  }
  
  if (member.nodeType === 'MethodDeclaration') { //TODO: override? Native?
    const { name, override, native, parameters, sentences } = member
    return `['${name}'](${compileParameters(parameters)}){${compileSentenceSequence(sentences)}}`
  }
}

const compileConstructor = (constructors, variableDeclarations) => {
  const constructorFunctions = constructors.map(({ parameters, sentences, baseTarget, baseArguments }) =>
    `___cons___[${baseArguments.length}] = (${compileParameters(parameters)}) => {
      ${baseTarget === SelfLiteral ? `___cons___['${baseArguments.length}']` : 'super'}(${compileArguments(baseArguments)});
      ${compileSentenceSequence(sentences)}
    }`
  )
  return `constructor(...___args___){___cons___ = {};${constructorFunctions.join(';')}; ___cons___[___args___.length](...___args___)}`
}  

const compileParameters = (params) => params.map(({name, varArg}) => varArg ? '...' + name : name).join()

const compileArguments = (args) => args.map(compileExpression).join()

const compileSentenceSequence = (sentences) => {
  const compiledSentences = sentences.map(compileSentence)
  if (compiledSentences.length && !compiledSentences[compiledSentences.length - 1].startsWith('return'))
    compiledSentences[compiledSentences.length - 1] = `return ${compiledSentences[compiledSentences.length - 1]}`
  return compiledSentences.join('')
}

const findByType = (content, type) => content.filter(c => c.nodeType === type)

//TODO: Imports
const compileFile = ({ content }) => {
  const imports = findByType(content, 'Import')
  const programs = findByType(content, 'Program')
  const tests = findByType('Test')
  const elements = content.filter(c => c.nodeType !== 'Test' && c.nodeType !== 'Program' && c.nodeType !== 'Import')

  if (!programs.length && !tests.length) {
    log.error('There is no program or tests to run!')
    process.exit(1)
  }

  const compiledElements = elements.map(compileElement).join(';')

  if (programs.length) {
    if (programs.length > 1) log.warn(`There is more than one program! Only ${programs[0].name} will be run.`)
    const { name, sentences } = programs[0]
    return `${compiledElements} ;(()=>{${compileSentenceSequence(sentences)}})()`
  }
  // TODO: Run tests
  tests.map(({ description, sentences }) => {
  })
}

export const interpretSentence = (ast) => eval(compileSentence(ast))
export const interpretElement = (ast) => eval(compileElement(ast))
export const interpretFile = (ast) => eval(compileFile(ast))

export default interpretFile
