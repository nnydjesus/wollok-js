import { addDefaultConstructor } from './transformations'

const { assign } = Object

const escape = str => ([
  'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if',
  'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected',
  'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof',
  'var', 'void', 'volatile', 'while', 'with', 'yield', 'Object', 'Exception', 'Set'
].indexOf(str) >= 0 ? `$${str}` : str)

const compileMethodDispatcher = members => ({ name }) =>
  `['${escape(name)}'](){
    const implementation$ = (...args) => {
      ${members.filter(({ name: n }) => n === name).map(compile).join(';\n')}
    }
    implementation$(arguments)
  }`


const compile = assign(expression => compile[expression.type](addDefaultConstructor(expression)), {
  // TODO: PACKAGE: ({ name, elements }) => {},

  Singleton: ({ name, superclass, mixins, superArguments, members }) =>
    `const ${escape(name)} = new class extends ${mixins.reduce((parent, mixin) => `${escape(mixin)}(${parent})`, escape(superclass))} {
      constructor(){
        super(${superArguments.map(compile).join()})
        ${members.filter(m => m.type === 'Field').map(compile).join(';\n')}
      }
      ${members.filter(m => m.type === 'Method').map(compileMethodDispatcher(members)).join(';\n')}
    }`,

  Mixin: ({ name, members }) =>
    `const ${escape(name)} = ($$superclass) => class extends $$superclass {
      constructor() {
        const $implementation = (...args) => {
          ${members.filter(m => m.type === 'Constructor').map(compile).join('\n')}
        }
        $implementation(...arguments)
        ${members.filter(m => m.type === 'Field').map(compile).join(';\n')}
      }
      ${members.filter(m => m.type === 'Method').map(compileMethodDispatcher(members)).join(';\n')}
    }`,

  Class: ({ name, superclass, mixins, members }) =>
    `export class ${escape(name)} extends ${name === 'Object' ? 'Object' : `${mixins.reduce((parent, mixin) => `${escape(mixin)}(${parent})`, escape(superclass))}`} {
      constructor() {
        const $implementation = (...args) => {
          ${members.filter(m => m.type === 'Constructor').map(compile).join('\n')}
        }
        $implementation(...arguments)
        ${members.filter(m => m.type === 'Field').map(compile).join(';\n')}
      }
      ${members.filter(m => m.type === 'Method').map(compileMethodDispatcher(members)).join(';\n')}
    }`,

  Constructor: ({ parameters, sentences, lookUpCall, baseArguments }) =>
    `const implementation$$${parameters.length} = (${parameters.map(compile).join()}) => {
      ${lookUpCall ? 'super' : '$implementation'}(${baseArguments.map(compile).join()});
      ${compile(sentences)}
    }
    if(args.length ${(parameters.length && parameters.slice(-1)[0].varArg) ? ` >= + ${parameters.length - 1}` : ` === ${parameters.length}`} ) {
      implementation$$${parameters.length}(...args)
    }
    `,

  Field: ({ variable, value }) => `${compile(variable)}=${compile(value)}`,

  // TODO: namespaces for natives
  Method: ({ name, parameters, sentences, native, parent }) =>
    `const implementation$$${parameters.length} = ${native
      ? `() => { return wollok.lang.${parent.name}['${escape(name)}'].bind(this)(...args) }`
      : `(${parameters.map(compile).join()}) => {${compile(sentences)}}`}
    if(args.length ${(parameters.length && parameters.slice(-1)[0].varArg) ? ` >= + ${parameters.length - 1}` : ` === ${parameters.length}`} ) {
      implementation$$${parameters.length}(...args)
    }`,

  VariableDeclaration: ({ variable, writeable, value }) => `${writeable ? 'let' : 'const'} ${compile(variable)} = ${compile(value)}`,

  Assignment: ({ variable, value }) => `${compile(variable)} = ${compile(value)}`,

  Variable: ({ name, link }) => (name === 'self' ? 'this' : `${link.type === 'Field' ? 'this.' : ''}${escape(name)}`),

  Send: ({ target, key, parameters }) => `${compile(target)}["${escape(key)}"](${parameters.map(compile).join()})`,

  New: ({ target, parameters }) => `new ${escape(target)}(${parameters.map(compile).join()})`,

  Super: ({ parameters }) => `super(${parameters.map(compile).join()})`,

  If: ({ condition, thenSentences, elseSentences }) =>
    `(() => { if (${compile(condition)}) {${compile(thenSentences)}} else {${compile(elseSentences)}}})()`,

  Return: ({ result }) => `return ${compile(result)}`,

  Throw: ({ exception }) => `(() => { throw ${compile(exception)} })()`,

  Try: ({ sentences, catches, always }) =>
    `(()=>{try{${compile(sentences)}}
    ${catches.length ? `catch(___ERROR___){${catches.map(compile).join(';\n')} throw ___ERROR___}` : ''}
    ${always.sentences.length ? `finally{${compile(always)}}` : ''}})()`,

  Catch: ({ variable, errorType, handler }) => {
    const evaluation = `const ${compile(variable)} = ___ERROR___;${compile(handler)}`
    return errorType ? `if (___ERROR___ instanceof ${errorType}){${evaluation}}` : evaluation
  },

  Literal: ({ value }) => {
    switch (typeof value) {
      case 'string': return `"${value.replace(/"/g, '\\"')}"`
      default: return `${value}`
    }
  },

  List: ({ values }) => `[ ${values.map(compile).join()} ]`,

  Closure: ({ parameters, sentences }) => `(function (${parameters.map(compile).join()}) {${compile(sentences)}})`,

  File: ({ content }) => {
    const hoist = (unhoisted, hoisted = []) => {
      if (!unhoisted.length) return hoisted

      const [next, ...others] = unhoisted

      const hoistedParentIndex = hoisted.findIndex(e => next.superclass === e.name)
      if (hoistedParentIndex >= 0) {
        const [parent, ...otherHoisted] = hoisted.splice(hoistedParentIndex)
        return hoist(others, [...hoisted, parent, next, ...otherHoisted])
      }

      const unhoistedParentIndex = others.findIndex(e => next.superclass === e.name)
      if (unhoistedParentIndex >= 0) {
        const [parent, ...otherUnhoisted] = others.splice(unhoistedParentIndex)
        return hoist([parent, next, ...otherUnhoisted], hoisted)
      }

      return hoist(others, [...hoisted, next])
    }

    return hoist(content).map(compile).join(';\n')
  },

  // TODO: Imports
  // TODO: tests

  Program: ({ name, sentences }) => `function ${escape(name)}(){${compile(sentences)}}`,

  Block: ({ sentences }) => {
    const compiledSentences = sentences.map(sentence => `${compile(sentence)};`)
    if (compiledSentences.length && !compiledSentences[compiledSentences.length - 1].startsWith('return')) {
      compiledSentences[compiledSentences.length - 1] = `return ${compiledSentences[compiledSentences.length - 1]}`
    }
    return compiledSentences.join(';\n')
  },

  Parameter: ({ name, varArg }) => (varArg ? `...${escape(name)}` : escape(name))
})


export default compile