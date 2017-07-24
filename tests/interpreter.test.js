// import { readFileSync } from 'fs'
import { describe, it } from 'mocha'
// import { expect } from 'chai'
// import compile from './../dist/compiler'
// import { link } from '../src/linker/linker'
// import parse from './../dist/parser'
import {
  Assignment,
  // Block,
  Catch,
  // Class,
  Closure,
  // Constructor,
  Send,
  // Field,
  If,
  // Import,
  List,
  // Method,
  // Mixin,
  // Singleton,
  New,
  // Package,
  Parameter,
  // Program,
  Return,
  Literal,
  // Super,
  // Test,
  Throw,
  Try,
  Variable,
  VariableDeclaration
} from '../src/model'

const fixture = new Map([

  //-------------------------------------------------------------------------------------------------------------------------------
  // SENTENCES
  //-------------------------------------------------------------------------------------------------------------------------------
  // Not very useful tests, but at least serves to check it does not crash...

  [VariableDeclaration(Variable('a'), true), undefined],
  [VariableDeclaration(Variable('a'), true, Literal(1)), undefined],
  [VariableDeclaration(Variable('a'), false, Literal(1)), undefined],


  [Send(Closure()(VariableDeclaration(Variable('a'), true), Variable('a')), 'call')(), null],
  [Send(Closure()(VariableDeclaration(Variable('a'), true, Literal(1)), Variable('a')), 'call')(), 1],
  [Send(Closure()(VariableDeclaration(Variable('a'), false, Literal(1)), Variable('a')), 'call')(), 1],

  [Send(Closure()(
    VariableDeclaration(Variable('a'), true, Literal(1)),
    Assignment(Variable('a'), Literal(2)),
    Variable('a')
  ), 'call')(), 2],
  [Assignment(Variable('a'), Literal(1)), new ReferenceError('a is not defined')],


  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS
  //-------------------------------------------------------------------------------------------------------------------------------

  [Variable('a'), new ReferenceError('a is not defined')],

  [Send(Literal(true), '||')(Literal(false)), true],
  [Send(Literal(true), 'or')(Literal(false)), true],
  [Send(Literal(true), '&&')(Literal(false)), false],
  [Send(Literal(true), 'and')(Literal(false)), false],
  [Send(Literal(5), '===')(Literal(3)), false],
  [Send(Literal(5), '!==')(Literal(3)), true],
  [Send(Literal(5), '==')(Literal(3)), false],
  [Send(Literal(5), '!=')(Literal(3)), true],
  [Send(Literal(5), '>=')(Literal(3)), true],
  [Send(Literal(5), '<=')(Literal(3)), false],
  [Send(Literal(5), '>')(Literal(3)), true],
  [Send(Literal(5), '<')(Literal(3)), false],
  [Send(Literal(5), '+')(Literal(3)), 8],
  [Send(Literal(5), '-')(Literal(3)), 2],
  [Send(Literal(5), '**')(Literal(3)), 125],
  [Send(Literal(5), '*')(Literal(3)), 15],
  [Send(Literal(5), '/')(Literal(3)), 5 / 3],
  [Send(Literal(5), '%')(Literal(3)), 2],

  [Send(Literal(5), '-_')(), -5],
  [Assignment(Variable('a'), Assignment(Variable('a'), Send(Variable('a'), '_++')())), new ReferenceError('a is not defined')],
  [Send(Variable('a'), '_--')(), new ReferenceError('a is not defined')],
  [Send(Literal(true), '!_')(), false],
  [Send(Literal(true), 'not_')(), false],

  [New('Set')(List(Literal(1), Literal(2))), new Set([1, 2])],

  // TODO: Super

  [If(Literal(true))(Literal(1))(Literal(2)), 1],
  [If(Literal(false))(Literal(1))(Literal(2)), 2],

  [Try(Literal(1))(Catch(Variable('e'))(Literal(2)))(), 1],
  [Try(Literal(1))()(Literal(3)), 3],
  [Try(Throw(Literal('woops')))(Catch(Variable('e'))(Literal(2)))(), 2],

  [Send(Closure()(
    Return(Literal(2)),
    Literal(1)
  ), 'call')(), 2],
  [Send(Closure()(
    Literal(1),
    Return(Literal(2))
  ), 'call')(), 2],


  //-------------------------------------------------------------------------------------------------------------------------------
  // LITERALS
  //-------------------------------------------------------------------------------------------------------------------------------

  [Literal(null), null],
  [Variable('this'), this],
  [Literal(true), true],
  [Literal(1), 1],
  [Literal(7.5), 7.5],
  [Literal('foo'), 'foo'],
  [List(Literal(1), Literal(2)), [1, 2]],
  [Closure(Parameter('a'))(Variable('a')), (a) => a],

  //-------------------------------------------------------------------------------------------------------------------------------
  // LIBRARY ELEMENTS
  //-------------------------------------------------------------------------------------------------------------------------------

  // TODO: Test Classes
  // TODO: Test Objects
])

describe('Wollok interpreter', () => {
  const fixture = []

  // const wre = require('./../dist/wre/wre.js')

  // for (const [ast, expected] of fixture.entries()) {
  //   const result = () => eval(wdk + compile(link(ast)))

  //   it(`should interpret ${JSON.stringify(ast)}`, () => {
  //     if (expected instanceof Error) expect(result).to.throw(expected.constructor, expected.message)
  //     else if (typeof expected === 'function') expect(escapeCode(result())).to.equal(escapeCode(expected))
  //     else expect(result(), `intepreting ${fixture}`).to.deep.equal(expected)
  //   })
  // }

})

const escapeCode = (code) => code.toString().replace(/[\n\t ]/g, '', '')