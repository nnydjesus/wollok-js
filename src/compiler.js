const { assign } = Object

// This interpreter compiles the AST to a string representing JS code and then evals it.
// I know, I know... But this is not meant to be nice or final code. Just a quick rough approach to get a better feeling on the AST shape.

const compile = assign(expression => compile[expression.type](expression), {
  // TODO: PACKAGE: ({ name, elements }) => {},

  Singleton: ({ name, superclass, mixins, superArguments, members }) =>
    `const ${name} = new class extends ${mixins.reduce((parent, mixin) => `${mixin}(${parent})`, superclass)} {
      constructor(){
        super(${superArguments.map(compile).join()})
        ${members.filter(m => m.type === 'Field').map(compile).join(';')}
      }
      ${members.filter(m => m.type !== 'Field').map(compile).join(';')}
    }`,

  Mixin: ({ name, members }) =>
    `const ${name} = ($superclass) => class extends $superclass {
      constructor(...$arguments) {
        ${members.filter(m => m.type === 'Field').map(compile).join(';')}
        this.constructor['$$init'+$arguments.length].bind(this)(...arguments)
      }
      ${members.filter(m => m.type !== 'Field').map(compile).join(';')}    
    }`,

  Class: ({ name, superclass, mixins, members }) =>
    `class ${name} extends ${mixins.reduce((parent, mixin) => `${mixin}(${parent})`, superclass)} {
      constructor(...$arguments) {
        ${members.filter(m => m.type === 'Field').map(compile).join(';')}
        this.constructor['$$init'+$arguments.length].bind(this)(...arguments)
      }
      ${members.filter(m => m.type !== 'Field').map(compile).join(';')}
    }`,

  Constructor: ({ parameters, sentences, lookUpCall, baseArguments }) =>
    `static $$init${parameters.length}(${parameters.map(compile).join()}) {
      ${lookUpCall ? 'super' : `this.constructor.$$init'${baseArguments.length}'`}(${baseArguments.map(compile).join()});
      ${compile(sentences)}
    }`,


  Field: ({ variable, value }) => `${compile(variable)}=${compile(value)}`,

  // TODO: namespaces for natives
  Method: ({ name, parameters, sentences, native, parent }) => (native
    ? `['${name}'](...$parameters){ return $wollok.${parent.name}['${name}'].bind(this)(...$parameters) }`
    : `['${name}'](${parameters.map(compile).join()}){${compile(sentences)}}`),

  VariableDeclaration: ({ variable, writeable, value }) => `${writeable ? 'let' : 'const'} ${compile(variable)} = ${compile(value)}`,

  Assignment: ({ variable, value }) => `${compile(variable)} = ${compile(value)}`,

  Variable: ({ name, link }) => (name === 'self' ? 'this' : `${link.type === 'Field' ? 'this.' : ''}${name}`),

  InstanceOf: ({ left, right }) => `${compile(left)} instanceof ${right}`,

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
    const evaluation = `const ${compile(variable)} = ___ERROR___;${compile(handler)}`
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