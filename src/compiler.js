import log from 'color-log'

const { assign } = Object

// This interpreter compiles the AST to a string representing JS code and then evals it.
// I know, I know... But this is not meant to be nice or final code. Just a quick rough approach to get a better feeling on the AST shape.

// TODO: Extract into separate module
const compile = assign(expression => compile[expression.nodeType](expression), {
  // TODO: PACKAGE: ({ name, elements }) => {},

  Singleton: ({ name, superclass, members }) => // TODO: Mixin linearization
    `const ${name} = new class extends ${superclass.name}{
      constructor(){super(${compileArguments(superclass.parameters)})};${members.map(compile).join(';')}
    };`,

  // TODO Mixin: ({ name, members }) => {},

  Class: ({ name, superclass, members }) => { // TODO: Mixin linearization
    const constructors = findByType(members, 'VariableDeclaration', m => m.value)
    const variableDeclarations = findByType(members, 'Constructor')

    const Constructor = `constructor(){
      ${variableDeclarations.map(({ name, value }) => `this.${name}=${compile(value)}`)}.join(';')
      ${constructors.map(compile)}
      this.constructor['__init'+arguments.length+'__'].bind(this)(...arguments)
    }`
    const memberDeclarations = members.filter(m => m.nodeType !== 'Constructor').map(compile).join(';')
    return `class ${name} extends ${superclass.name} { ${Constructor} ${memberDeclarations} }`
  },

  Constructor: ({ parameters, sentences, lookUpCall, baseArguments }) =>
    `static ___init${parameters.length}___(${compileParameters(parameters)}) {
      ${lookUpCall ? 'super' : `this.constructor.__init'${baseArguments.length}___'`}(${compileArguments(baseArguments)});
      ${compile(sentences)}
    }`,


  Field: ({ variable, writeable }) => {
    const getter = `get ['${variable.name}']() {return this['___${variable.name}___']}`
    const setter = `set ['${variable.name}'](___value___) {this['___${variable.name}___'] = ___value___}`
    return writeable ? getter + setter : getter
  },

  // TODO: override? Native?
  Method: ({ name, parameters, sentences }) => `['${name}'](${compileParameters(parameters)}){${compile(sentences)}}`,

  VariableDeclaration: ({ variable, writeable, value }) => `${writeable ? 'let' : 'const'} ${variable.name} = ${compile(value)}`,

  Assignment: ({ variable, value }) => `${variable.name} = ${compile(value)}`,

  Variable: ({ name }) => `${name}`,

  BinaryOp: ({ op, left, right }) => {
    const rightOperand = compile(right)
    const leftOperand = compile(left)

    switch (op) { // TODO: Other Ops: '..<' / '>..' / '..' / '->' / '>>>' / '>>' / '<<<' / '<<' / '<=>' / '<>' / '?:'
      case 'or': return `(${leftOperand} || ${rightOperand})`
      case 'and': return `(${leftOperand} && ${rightOperand})`
      case '===': return `Object.is(${leftOperand},${rightOperand})`
      case '!==': return `!Object.is(${leftOperand},${rightOperand})`
      case '==': return `(${leftOperand} === ${rightOperand})`
      case '!=': return `(${leftOperand} !== ${rightOperand})`
      case '**': return `Math.pow(${leftOperand},${rightOperand})`
      case '||':
      case '&&':
      case '>=':
      case '<=':
      case '>':
      case '<':
      case '+':
      case '-':
      case '*':
      case '/':
      case '%': return `(${leftOperand} ${op} ${rightOperand})`
      default: throw TypeError('Unsupported operator')
    }
  },

  UnaryOp: ({ op, target }) => {
    const operand = compile(target)
    switch (op) {
      case 'not':
      case '!': return `!${operand}`
      case '-': return `-${operand}`
      case '++': return `${operand}++`
      case '--': return `${operand}--`
      default: throw TypeError('Unsupported operator')
      // case '+': TODO: WTF does this do?
    }
  },

  InstanceOf: ({ left, right }) => `${compile(left)} instanceof ${right}`,

  // TODO: Nullsafe? Do we really want this?
  Send: ({ target, key, parameters }) => `${compile(target)}["${key}"](${compileArguments(parameters)})`,

  New: ({ target, parameters }) => `new ${target}(${compileArguments(parameters)})`,

  Super: ({ parameters }) => `super(${compileArguments(parameters)})`,

  If: ({ condition, thenSentences, elseSentences }) =>
    `(() => { if (${compile(condition)}) {${compile(thenSentences)}} else {${compile(elseSentences)}}})()`,

  Return: ({ result }) => `return ${compile(result)}`,

  Throw: ({ exception }) => `(() => { throw ${compile(exception)} })()`,

  Try: ({ sentences, catches, always }) =>
    `(()=>{try{${compile(sentences)}}
    ${catches.length ? `catch(___ERROR___){${catches.map(compile).join(';')} throw ___ERROR___}` : ''}
    ${always.sentences.length ? `finally{${compile(always)}}` : ''}})()`,

  Catch: ({ variable, type, handler }) => {
    const evaluation = `const ${variable.name} = ___ERROR___;${compile(handler)}`
    return type ? `if (___ERROR___ instanceof ${type}){${evaluation}}` : evaluation
  },

  Literal: ({ value }) => {
    switch (typeof value) {
      case 'string': return `"${value}"`
      default: return `${value}`
    }
  },

  ListLiteral: ({ values }) => `[ ${values.map(compile).join()} ]`,

  Closure: ({ parameters, sentences }) => `(function (${compileParameters(parameters)}) {${compile(sentences)}})`,

  File: ({ content }) => {
    // TODO: Imports const imports = findByType(content, 'Import')
    const programs = findByType(content, 'Program')
    const tests = findByType('Test')
    const elements = content.filter(c => c.nodeType !== 'Test' && c.nodeType !== 'Program' && c.nodeType !== 'Import')

    if (!programs.length && !tests.length) {
      log.error('There is no program or tests to run!')
      process.exit(1)
    }

    const compiledElements = elements.map(compile).join(';')

    if (programs.length) {
      if (programs.length > 1) log.warn(`There is more than one program! Only ${programs[0].name} will be run.`)
      return `${compiledElements} ;(()=>{${compile(programs[0].sentences)}})()` // TODO: Extract Program compile
    }
    // TODO: Run tests tests.map(({ description, sentences }) => { })
  },

  Block: ({ sentences }) => {
    const compiledSentences = sentences.map(sentence => `${compile(sentence)};`)
    if (compiledSentences.length && !compiledSentences[compiledSentences.length - 1].startsWith('return')) {
      compiledSentences[compiledSentences.length - 1] = `return ${compiledSentences[compiledSentences.length - 1]}`
    }
    return compiledSentences.join(';')
  }
})

const compileParameters = (params) => params.map(({ name, varArg }) => (varArg ? `...${name}` : name)).join()

const compileArguments = (args) => args.map(compile).join()

// TODO: Wherever we use this, we should have separate field in the model instead
const findByType = (content, type, extraCondition = () => true) => content.filter(c => c.nodeType === type && extraCondition(c))

export default compile