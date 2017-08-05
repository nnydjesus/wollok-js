import { Assignment, Block, Catch, Class, Closure, Constructor, Field, File, If, List, Literal, Method, Mixin, New, Parameter, Program, Reference, Return, Send, Singleton, Super, Throw, Try, VariableDeclaration, traverse } from './model'
import { Link } from './linker/steps/link'
import { resolvePath } from './linker/scoping'

import { addDefaultConstructor } from './transformations'

const escape = str => ([
  'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if',
  'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected',
  'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof',
  'var', 'void', 'volatile', 'while', 'with', 'yield', 'Object', 'Boolean', 'String', 'Set'
].indexOf(str) >= 0 ? `$${str}` : str)

const compileWithNatives = (natives = {}) => {

  const compileMethodDispatcher = members => ({ name }) =>
    `this['${escape(name)}'] = (function(){
    const implementation$ = (...args) => {
      ${members.filter(({ name: n }) => n === name).map(compile).join(';\n')}
    }
    return implementation$(...arguments)
  }).bind(this)`

  const compile = traverse({
    // TODO: PACKAGE: ({ name, elements }) => {},

    [Singleton]: ({ name, superclass: superclassName, mixins, superArguments, members }) => {
      const superclass = superclassName.type === Link.name ? superclassName.token : superclassName
      return `const ${escape(name)} = new class extends ${mixins.reduce((parent, mixin) => `${escape(mixin)}(${parent})`, escape(superclass))} {
      constructor(){
        super(${superArguments.map(compile).join()})
        ${members.filter(m => m.type === 'Field').map(compile).join(';\n')}
        ${members.filter(m => m.type === 'Method').map(compileMethodDispatcher(members)).join(';\n')}
      }
    }`
    },

    [Mixin]: ({ name, members }) =>
      `const ${escape(name)} = ($$superclass) => class extends $$superclass {
      constructor() {
        let $instance = undefined
        ${members.filter(m => m.type === 'Constructor').map(compile).join('\n')}
        (function(){${members.filter(m => m.type === 'Field').map(compile).join(';\n')}}).call($instance)
        ${members.filter(m => m.type === 'Method').map(compileMethodDispatcher(members)).join(';\n')}
        return $instance
      }
    }`,

    [Class]: ({ name, superclass: superclassName, mixins, members }) => {
      const superclass = superclassName && superclassName.type === Link.name ? superclassName.token : superclassName
      return `class ${escape(name)} extends ${name === 'Object' ? 'Object' : `${mixins.reduce((parent, mixin) => `${escape(mixin)}(${parent})`, escape(superclass))}`} {
      constructor() {
        let $instance = undefined
        ${members.filter(m => m.type === 'Constructor').map(compile).join('\n')}
        (function(){${members.filter(m => m.type === 'Field').map(compile).join(';\n')}}).call($instance)
        ${members.filter(m => m.type === 'Method').map(compileMethodDispatcher(members)).join(';\n')}
        return $instance
      }
    }`
    },

    [Constructor]: ({ parameters, parent, baseArguments, lookUpCall, sentences }) => `
    if(arguments.length ${(parameters.length && parameters.slice(-1)[0].varArg) ? '+ 1 >=' : '==='} ${parameters.length}) {
      $instance = ${lookUpCall ? 'super' : `new ${parent.name}`}(${baseArguments.map(compile).join()});
      (function (${parameters.map(compile).join()}){${compile(sentences)}}).call($instance,...arguments)
    }`,

    [Field]: ({ variable, value }) => `${compile(variable)}=${compile(value)}`,

    [Method]: ({ name, parameters, sentences, native, parent }) => {
      if (native && !(natives[parent.name] && natives[parent.name][name])) throw new TypeError(`Missing native implementation for ${parent.name}.${name}(...)`)
      return `const implementation$$${parameters.length} = ${native
        ? `(function ${natives[parent.name][name].toString().slice(natives[parent.name][name].toString().indexOf('('))}).bind(this)`
        : `(${parameters.map(compile).join()}) => {${compile(sentences)}}`}
        if (args.length ${(parameters.length && parameters.slice(-1)[0].varArg) ? ` >= + ${parameters.length - 1}` : ` === ${parameters.length}`} ) {
          return implementation$$${parameters.length} (...args)
        }`
    },

    [VariableDeclaration]: ({ variable, writeable, value }) => `${writeable ? 'let' : 'const'} ${compile(variable)} = ${compile(value)}`,

    [Assignment]: ({ variable, value }) => `${compile(variable)} = ${compile(value)}`,

    [Reference]: ({ name }) => {
      // unresolved
      if (name.type !== Link.name) return escape(name)
      // resolved
      const { token, path } = name
      if (token === 'self') { return 'this' }
      const resolved = resolvePath(name, path)
      return (`${resolved.type === 'Field' ? 'this.' : ''}${escape(token)}`)
    },

    [Send]: ({ target, key, parameters }) => `${compile(target)}["${escape(key)}"](${parameters.map(compile).join()})`,

    [New]: ({ target, parameters }) => `new ${escape(target.type === Link.name ? target.token : target)}(${parameters.map(compile).join()})`,

    [Super]: ({ parameters }) => `super(${parameters.map(compile).join()})`,

    [If]: ({ condition, thenSentences, elseSentences }) =>
      `(() => { if (${compile(condition)}) {${compile(thenSentences)}} else {${compile(elseSentences)}}})()`,

    [Return]: ({ result }) => `return ${compile(result)}`,

    [Throw]: ({ exception }) => `(() => { throw ${compile(exception)} })()`,

    [Try]: ({ sentences, catches, always }) => `(()=> {
      let $response;
      try {
        $response = (()=>{${compile(sentences)}})()
      }
      catch($error){
        ${always.sentences.length ? `(()=>{${compile(always)}})();` : ''}
        ${catches.map(compile).join(';\n')}
        throw $error
      }
      return ${always.sentences.length ? `(()=>{${compile(always)}})()` : '$response'}
    })()`,

    [Catch]: ({ variable, errorType, handler }) =>
      `if (${errorType ? `$error instanceof ${errorType}` : 'true'} ) {
        return ((${compile(variable)}) => {${compile(handler)}})($error)
      }`,

    [Literal]: ({ value }) => {
      switch (typeof value) {
        case 'number': return `(()=>{
          const $value = new ${value % 1 === 0 ? 'Integer' : 'Double'}()
          $value.$inner = ${value}
          return $value
        })()`
        case 'string': return `(()=>{
          const $value = new $String()
          $value.$inner = "${value.replace(/"/g, '\\"')}"
          return $value
        })()`
        case 'boolean': return `(()=>{
          const $value = new $Boolean()
          $value.$inner = ${value}
          return $value
        })()`
        default: return `${value}`
      }
    },

    [List]: ({ values }) => `(() => {
      const l = new List();
      l.$inner = [ ${values.map(compile).join()} ]
      return l
    })()`,

    [Closure]: ({ parameters, sentences }) => `(() => {
      const c = new Closure();
      c.$inner = function (${parameters.map(compile).join()}) { ${compile(sentences)} }
      return c
    })()`,

    [File]: ({ content }) => {
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
          return hoist([parent, next, ...others, ...otherUnhoisted], hoisted)
        }

        return hoist(others, [...hoisted, next])
      }

      return hoist(content).map(compile).join(';\n')
    },

    // TODO: Imports
    // TODO: tests

    [Program]: ({ name, sentences }) => `function ${escape(name)}(){${compile(sentences)}}`,

    [Block]: ({ sentences }) => {
      const compiledSentences = sentences.map(sentence => `${compile(sentence)};`)
      if (compiledSentences.length && !compiledSentences[compiledSentences.length - 1].startsWith('return')) {
        compiledSentences[compiledSentences.length - 1] = `return ${compiledSentences[compiledSentences.length - 1]}`
      }
      return compiledSentences.join(';\n')
    },

    [Parameter]: ({ name, varArg }) => (varArg ? `...${escape(name)}` : escape(name))
  })

  return compile
}

export default (model, natives) => compileWithNatives(natives)(addDefaultConstructor(model))