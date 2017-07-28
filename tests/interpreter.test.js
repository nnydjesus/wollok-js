import {
  Assignment,
  Catch,
  Closure as ClosureNode,
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
import { describe, it } from 'mocha'
import { interpreter, linker, parser } from '../src/index'

import { expect } from 'chai'
import langNatives from '../dist/wre/lang.natives'
import { readFileSync } from 'fs'

const lang = linker(parser(readFileSync('src/wre/lang.wlk', 'utf8')))
const interpret = (...asts) => interpreter(langNatives)(lang, ...asts)

describe('Wollok interpreter', () => {

  it('should interpret literals', () => {
    expect(interpret(Literal(5))).to.equal(5)
    expect(interpret(Literal(null))).to.equal(null)
    expect(interpret(Literal('foo'))).to.equal('foo')
    expect(interpret(Literal(true))).to.equal(true)
  })

  it('should interpret lists', () => {
    const list = interpret(List(Literal(1), Literal(2), Literal(3)))
    expect(list.size()).to.equal(3)
    expect(list.get(0)).to.equal(1)
    expect(list.get(1)).to.equal(2)
    expect(list.get(2)).to.equal(3)
  })

  it('should interpret closures', () => {
    expect(interpret(Send(ClosureNode(Parameter())(Literal(5)), 'apply')())).to.equal(5)
    expect(interpret(Send(ClosureNode(Parameter('x'))(Reference('x')), 'apply')(Literal(5)))).to.equal(5)
  })

  it('should interpret references', () => {
    expect(interpret(VariableDeclaration(Reference('a')), Reference('a'))).to.equal(null)
    expect(interpret(VariableDeclaration(Reference('a'), true, Literal(5)), Reference('a'))).to.equal(5)
    expect(() => interpret(Reference('a'))).to.throw(ReferenceError, 'a is not defined')
  })

  //-------------------------------------------------------------------------------------------------------------------------------
  // SENTENCES
  //-------------------------------------------------------------------------------------------------------------------------------
  // Not very useful tests, but at least serves to check it does not crash...

  // [VariableDeclaration(Reference('a'), true), undefined],
  // [VariableDeclaration(Reference('a'), true, Literal(1)), undefined],
  // [VariableDeclaration(Reference('a'), false, Literal(1)), undefined],


  // [Send(ClosureNode()(VariableDeclaration(Reference('a'), true), Reference('a')), 'call')(), null],
  // [Send(ClosureNode()(VariableDeclaration(Reference('a'), true, Literal(1)), Reference('a')), 'call')(), 1],
  // [Send(ClosureNode()(VariableDeclaration(Reference('a'), false, Literal(1)), Reference('a')), 'call')(), 1],

  // [Send(ClosureNode()(
  //   VariableDeclaration(Reference('a'), true, Literal(1)),
  //   Assignment(Reference('a'), Literal(2)),
  //   Reference('a')
  // ), 'call')(), 2],
  // [Assignment(Reference('a'), Literal(1)), new ReferenceError('a is not defined')],


  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS
  //-------------------------------------------------------------------------------------------------------------------------------

  // [Send(Literal(true), '||')(Literal(false)), true],
  // [Send(Literal(true), 'or')(Literal(false)), true],
  // [Send(Literal(true), '&&')(Literal(false)), false],
  // [Send(Literal(true), 'and')(Literal(false)), false],
  // [Send(Literal(5), '===')(Literal(3)), false],
  // [Send(Literal(5), '!==')(Literal(3)), true],
  // [Send(Literal(5), '==')(Literal(3)), false],
  // [Send(Literal(5), '!=')(Literal(3)), true],
  // [Send(Literal(5), '>=')(Literal(3)), true],
  // [Send(Literal(5), '<=')(Literal(3)), false],
  // [Send(Literal(5), '>')(Literal(3)), true],
  // [Send(Literal(5), '<')(Literal(3)), false],
  // [Send(Literal(5), '+')(Literal(3)), 8],
  // [Send(Literal(5), '-')(Literal(3)), 2],
  // [Send(Literal(5), '**')(Literal(3)), 125],
  // [Send(Literal(5), '*')(Literal(3)), 15],
  // [Send(Literal(5), '/')(Literal(3)), 5 / 3],
  // [Send(Literal(5), '%')(Literal(3)), 2],

  // [Send(Literal(5), '-_')(), -5],
  // [Assignment(Reference('a'), Assignment(Reference('a'), Send(Reference('a'), '_++')())), new ReferenceError('a is not defined')],
  // [Send(Reference('a'), '_--')(), new ReferenceError('a is not defined')],
  // [Send(Literal(true), '!_')(), false],
  // [Send(Literal(true), 'not_')(), false],

  // [New('Set')(List(Literal(1), Literal(2))), new Set([1, 2])],



  // TODO: Super

  // [If(Literal(true))(Literal(1))(Literal(2)), 1],
  // [If(Literal(false))(Literal(1))(Literal(2)), 2],

  // [Try(Literal(1))(Catch(Reference('e'))(Literal(2)))(), 1],
  // [Try(Literal(1))()(Literal(3)), 3],
  // [Try(Throw(Literal('woops')))(Catch(Reference('e'))(Literal(2)))(), 2],

  // [Send(ClosureNode()(
  //   Return(Literal(2)),
  //   Literal(1)
  // ), 'call')(), 2],
  // [Send(ClosureNode()(
  //   Literal(1),
  //   Return(Literal(2))
  // ), 'call')(), 2],

  //-------------------------------------------------------------------------------------------------------------------------------
  // LIBRARY ELEMENTS
  //-------------------------------------------------------------------------------------------------------------------------------

  // TODO: Test Classes
  // TODO: Test Mixins
  // TODO: Test Objects


})