import { Assignment, Block, Catch, Class, Closure, Constructor, Field, File, If, List, Literal, Method, Mixin, New, Parameter, Program, Reference, Return, Send, Singleton, Super, Throw, Try, VariableDeclaration, traverse } from './model'
import { Link } from './linker/steps/link'
import { resolvePath } from './linker/scoping'


const validateWithNatives = (natives = {}) => {


  const validate = traverse({
    // TODO: PACKAGE: ({ name, elements }) => {},

    [Singleton]: ({ name, superclass: superclassName, mixins, superArguments, members }) => {
        members.map(validate)
    },

    [Mixin]: ({ name, members }) => true,

    [Class]: ({ name, superclass: superclassName, mixins, members }) => true,

    [Constructor]: ({ parameters, parent, baseArguments, lookUpCall, sentences }) => true,

    [Field]: ({ variable, value }) => true,

    [Method]: ({ name, parameters, sentences, native, parent }) => {
        validate(sentences)
    },

    [VariableDeclaration]: ({ variable, writeable, value }) => true,

    [Assignment]: ({ variable, value }) => {
        console.log(variable)
    },

    [Reference]: ({ name }) =>true,

    [Send]: ({ target, key, parameters }) => true,

    [New]: ({ target, parameters }) => true,

    [Super]: ({ parameters }) => true,

    [If]: ({ condition, thenSentences, elseSentences }) =>true,

    [Return]: ({ result }) => true,

    [Throw]: ({ exception }) => true,

    [Try]: ({ sentences, catches, always }) => true,

    [Catch]: ({ variable, errorType, handler }) =>true,

    [Literal]: ({ value }) => true,

    [List]: ({ values }) => true,

    [Closure]: ({ parameters, sentences }) => true,

    [File]: ({ content }) => content.map(validate),

    // TODO: Imports
    // TODO: tests

    [Program]: ({ name, sentences }) => true,

    [Block]: ({ sentences }) =>{
        sentences.map(validate)
    },

    [Parameter]: ({ name, varArg }) => true
  })

  return validate
}

export default (model, natives) => validateWithNatives(natives)(model)