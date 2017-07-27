// import * as wre from '../dist/wre/wre'

import {
  Assignment,
  Catch,
  Closure,
  If,
  List,
  Literal,
  New,
  Parameter,
  Reference,
  Return,
  Send,
  Throw,
  Try,
  VariableDeclaration
} from '../src/model'
import {
  describe,
  it
} from 'mocha'

const fixture = new Map([

  //-------------------------------------------------------------------------------------------------------------------------------
  // SENTENCES
  //-------------------------------------------------------------------------------------------------------------------------------
  // Not very useful tests, but at least serves to check it does not crash...

  [VariableDeclaration(Reference('a'), true), undefined],
  [VariableDeclaration(Reference('a'), true, Literal(1)), undefined],
  [VariableDeclaration(Reference('a'), false, Literal(1)), undefined],


  [Send(Closure()(VariableDeclaration(Reference('a'), true), Reference('a')), 'call')(), null],
  [Send(Closure()(VariableDeclaration(Reference('a'), true, Literal(1)), Reference('a')), 'call')(), 1],
  [Send(Closure()(VariableDeclaration(Reference('a'), false, Literal(1)), Reference('a')), 'call')(), 1],

  [Send(Closure()(
    VariableDeclaration(Reference('a'), true, Literal(1)),
    Assignment(Reference('a'), Literal(2)),
    Reference('a')
  ), 'call')(), 2],
  [Assignment(Reference('a'), Literal(1)), new ReferenceError('a is not defined')],


  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS
  //-------------------------------------------------------------------------------------------------------------------------------

  [Reference('a'), new ReferenceError('a is not defined')],

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
  [Assignment(Reference('a'), Assignment(Reference('a'), Send(Reference('a'), '_++')())), new ReferenceError('a is not defined')],
  [Send(Reference('a'), '_--')(), new ReferenceError('a is not defined')],
  [Send(Literal(true), '!_')(), false],
  [Send(Literal(true), 'not_')(), false],

  [New('Set')(List(Literal(1), Literal(2))), new Set([1, 2])],

  // TODO: Super

  [If(Literal(true))(Literal(1))(Literal(2)), 1],
  [If(Literal(false))(Literal(1))(Literal(2)), 2],

  [Try(Literal(1))(Catch(Reference('e'))(Literal(2)))(), 1],
  [Try(Literal(1))()(Literal(3)), 3],
  [Try(Throw(Literal('woops')))(Catch(Reference('e'))(Literal(2)))(), 2],

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
  [Reference('this'), this],
  [Literal(true), true],
  [Literal(1), 1],
  [Literal(7.5), 7.5],
  [Literal('foo'), 'foo'],
  [List(Literal(1), Literal(2)), [1, 2]],
  [Closure(Parameter('a'))(Reference('a')), (a) => a],

  //-------------------------------------------------------------------------------------------------------------------------------
  // LIBRARY ELEMENTS
  //-------------------------------------------------------------------------------------------------------------------------------

  // TODO: Test Classes
  // TODO: Test Objects
])


describe('Wollok interpreter', () => {
  const fixture = []

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