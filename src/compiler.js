import log from 'color-log'

const { assign } = Object

// This interpreter compiles the AST to a string representing JS code and then evals it.
// I know, I know... But this is not meant to be nice or final code. Just a quick rough approach to get a better feeling on the AST shape.

// TODO: Extract into separate module
const compile = assign(expression => compile[expression.type](expression), {
  // TODO: PACKAGE: ({ name, elements }) => {},

  Singleton: ({ name, superclass, superArguments, members }) => // TODO: Mixin linearization
    `const ${name} = new class extends ${superclass}{
      constructor(){super(${superArguments.map(compile).join()})};${members.map(compile).join(';')}
    };`,

  // TODO Mixin: ({ name, members }) => {},

  Class: ({ name, superclass, members }) => // TODO: Mixin linearization
    `class ${name} extends ${superclass} {
      constructor() {
        ${members.filter(m => m.type === 'Field').map(({ name, value }) => `this.${name}=${compile(value)}`)}.join(';')
        this.constructor['__init'+arguments.length+'__'].bind(this)(...arguments)
      }
      ${members.map(compile).join(';')}
    }`,

  Constructor: ({ parameters, sentences, lookUpCall, baseArguments }) =>
    `static ___init${parameters.length}___(${parameters.map(compile).join()}) {
      ${lookUpCall ? 'super' : `this.constructor.__init'${baseArguments.length}___'`}(${baseArguments.map(compile).join()});
      ${compile(sentences)}
    }`,


  Field: ({ variable, writeable }) => {
    const getter = `get ['${variable.name}']() {return this['___${variable.name}___']}`
    const setter = `set ['${variable.name}'](___value___) {this['___${variable.name}___'] = ___value___}`
    return writeable ? getter + setter : getter
  },

  // TODO: override? Native?
  Method: ({ name, parameters, sentences }) => `['${name}'](${parameters.map(compile).join()}){${compile(sentences)}}`,

  VariableDeclaration: ({ variable, writeable, value }) => `${writeable ? 'let' : 'const'} ${variable.name} = ${compile(value)}`,

  Assignment: ({ variable, value }) => `${variable.name} = ${compile(value)}`,

  Variable: ({ name }) => `${name}`,

  InstanceOf: ({ left, right }) => `${compile(left)} instanceof ${right}`,

  // TODO: Nullsafe? Do we really want this?
  Send: ({ target, key, parameters }) => `${compile(target)}["${key}"](${parameters.map(compile).join()})`,

  New: ({ target, parameters }) => `new ${target}(${parameters.map(compile).join()})`,

  Super: ({ parameters }) => `super(${parameters.map(compile).join()})`,

  If: ({ condition, thenSentences, elseSentences }) =>
    `(() => { if (${compile(condition)}) {${compile(thenSentences)}} else {${compile(elseSentences)}}})()`,

  Return: ({ result }) => `return ${compile(result)}`,

  Throw: ({ exception }) => `(() => { throw ${compile(exception)} })()`,

  Try: ({ sentences, catches, always }) =>
    `(()=>{try{${compile(sentences)}}
    ${catches.length ? `catch(___ERROR___){${catches.map(compile).join(';')} throw ___ERROR___}` : ''}
    ${always.sentences.length ? `finally{${compile(always)}}` : ''}})()`,

  Catch: ({ variable, errorType, handler }) => {
    const evaluation = `const ${variable.name} = ___ERROR___;${compile(handler)}`
    return errorType ? `if (___ERROR___ instanceof ${errorType}){${evaluation}}` : evaluation
  },

  Literal: ({ value }) => {
    switch (typeof value) {
      case 'string': return `"${value}"`
      default: return `${value}`
    }
  },

  List: ({ values }) => `[ ${values.map(compile).join()} ]`,

  Closure: ({ parameters, sentences }) => `(function (${parameters.map(compile).join()}) {${compile(sentences)}})`,

  File: ({ content }) => content.map(compile).join(';'),
  // TODO: Imports
  // TODO: tests

  Program: ({ name, sentences }) => `function ${name}(){${compile(sentences)}}`,

  Block: ({ sentences }) => {
    const compiledSentences = sentences.map(sentence => `${compile(sentence)};`)
    if (compiledSentences.length && !compiledSentences[compiledSentences.length - 1].startsWith('return')) {
      compiledSentences[compiledSentences.length - 1] = `return ${compiledSentences[compiledSentences.length - 1]}`
    }
    return compiledSentences.join(';')
  },

  Parameter: ({ name, varArg }) => (varArg ? `...${name}` : name)
})

export default compile