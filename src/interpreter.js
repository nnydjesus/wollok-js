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

//-------------------------------------------------------------------------------------------------------------------------------
// FILE
//-------------------------------------------------------------------------------------------------------------------------------

const interpretFile = ({content}) => {
  const classes  = content.filter(element => element.nodeType === 'ClassDeclaration')
  const mixins   = content.filter(element => element.nodeType === 'MixinDeclaration')
  const objects  = content.filter(element => element.nodeType === 'ObjectDeclaration')
  const programs = content.filter(element => element.nodeType === 'Program')
  const tests    = content.filter(element => element.nodeType === 'Test')

  if(!programs.length && ! tests.length) {
    log.error('No program or tests found. There is nothing to execute!')
    process.exit(1)
  }

  if(programs.length > 1) log.warn(`More than one main program found. Executing ${programs[0].name}`)

  const main = programs.length ? [programs[0]] : tests

  log.info('Loading classes:')
  classes.forEach(interpretClass)

  log.info('Loading mixins:')
  classes.forEach(c => { log.info(c.name) })

  log.info('Loading objects:')
  classes.forEach(c => { log.info(c.name) })

  log.info('Loading objects:')
  classes.forEach(c => { log.info(c.name) })
}

//-------------------------------------------------------------------------------------------------------------------------------
// LIBRARY ELEMENTS
//-------------------------------------------------------------------------------------------------------------------------------

const interpretClass= ({name, superclass, mixins, members}) => {

  const compiledClass = class extends (superclass.name || Object) {
    static get name() { return name }
  }

  log.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  log.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  log.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  log.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  log.warn(compiledClass)
  log.warn(new compiledClass())
  log.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

  return compiledClass
}


export default interpretFile