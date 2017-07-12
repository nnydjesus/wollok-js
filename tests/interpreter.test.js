import { describe, it } from 'mocha'
import { expect } from 'chai'
import interpret from '../src/interpreter'
import {
  Assignment,
  BinaryOp,
  // Block,
  Catch,
  // ClassDeclaration,
  Closure,
  // ConstructorDeclaration,
  FeatureCall,
  // FieldDeclaration,
  If,
  // Import,
  InstanceOf,
  ListLiteral,
  // MethodDeclaration,
  // MixinDeclaration,
  // ObjectDeclaration,
  New,
  // Package,
  Parameter,
  // Program,
  Return,
  SelfLiteral,
  SetLiteral,
  Literal,
  // Super,
  // SuperLiteral,
  // SuperType,
  // Test,
  Throw,
  Try,
  UnaryOp,
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


  [FeatureCall(Closure()(VariableDeclaration(Variable('a'), true), Variable('a')), 'call')(), null],
  [FeatureCall(Closure()(VariableDeclaration(Variable('a'), true, Literal(1)), Variable('a')), 'call')(), 1],
  [FeatureCall(Closure()(VariableDeclaration(Variable('a'), false, Literal(1)), Variable('a')), 'call')(), 1],

  [FeatureCall(Closure()(
    VariableDeclaration(Variable('a'), true, Literal(1)),
    Assignment(Variable('a'), Literal(2)),
    Variable('a')
  ), 'call')(), 2],
  [Assignment(Variable('a'), Literal(1)), new ReferenceError('a is not defined')],


  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS
  //-------------------------------------------------------------------------------------------------------------------------------

  [Variable('a'), new ReferenceError('a is not defined')],

  [BinaryOp('||', Literal(true), Literal(false)), true],
  [BinaryOp('or', Literal(true), Literal(false)), true],
  [BinaryOp('&&', Literal(true), Literal(false)), false],
  [BinaryOp('and', Literal(true), Literal(false)), false],
  [BinaryOp('===', Literal(5), Literal(3)), false],
  [BinaryOp('!==', Literal(5), Literal(3)), true],
  [BinaryOp('==', Literal(5), Literal(3)), false],
  [BinaryOp('!=', Literal(5), Literal(3)), true],
  [BinaryOp('>=', Literal(5), Literal(3)), true],
  [BinaryOp('<=', Literal(5), Literal(3)), false],
  [BinaryOp('>', Literal(5), Literal(3)), true],
  [BinaryOp('<', Literal(5), Literal(3)), false],
  [BinaryOp('+', Literal(5), Literal(3)), 8],
  [BinaryOp('-', Literal(5), Literal(3)), 2],
  [BinaryOp('**', Literal(5), Literal(3)), 125],
  [BinaryOp('*', Literal(5), Literal(3)), 15],
  [BinaryOp('/', Literal(5), Literal(3)), 5 / 3],
  [BinaryOp('%', Literal(5), Literal(3)), 2],
  // TODO: Other Ops: '..<' / '>..' / '..' / '->' / '>>>' / '>>' / '<<<' / '<<' / '<=>' / '<>' / '?:'

  [UnaryOp('-', Literal(5)), -5],
  [UnaryOp('++', Variable('a')), new ReferenceError('a is not defined')],
  [UnaryOp('--', Variable('a')), new ReferenceError('a is not defined')],
  [UnaryOp('!', Literal(true)), false],
  [UnaryOp('not', Literal(true)), false],
  // TODO: prefix +: WTF does it do???

  [InstanceOf(SetLiteral(), 'Set'), true],

  [New('Set')(ListLiteral(Literal(1), Literal(2))), new Set([1, 2])],

  // TODO: Super

  [If(Literal(true))(Literal(1))(Literal(2)), 1],
  [If(Literal(false))(Literal(1))(Literal(2)), 2],

  [Try(Literal(1))(Catch(Variable('e'))(Literal(2)))(), 1],
  [Try(Literal(1))()(Literal(3)), 3],
  [Try(Throw(Literal('woops')))(Catch(Variable('e'))(Literal(2)))(), 2],

  [FeatureCall(Closure()(
    Return(Literal(2)),
    Literal(1)
  ), 'call')(), 2],
  [FeatureCall(Closure()(
    Literal(1),
    Return(Literal(2))
  ), 'call')(), 2],


  //-------------------------------------------------------------------------------------------------------------------------------
  // LITERALS
  //-------------------------------------------------------------------------------------------------------------------------------

  [Literal(null), null],
  [SelfLiteral, this],
  [Literal(true), true],
  [Literal(1), 1],
  [Literal(7.5), 7.5],
  [Literal('foo'), 'foo'],
  [SetLiteral(Literal(1), Literal(2)), new Set([1, 2])],
  [ListLiteral(Literal(1), Literal(2)), [1, 2]],
  [Closure(Parameter('a'))(Variable('a')), (a) => a],

  //-------------------------------------------------------------------------------------------------------------------------------
  // LIBRARY ELEMENTS
  //-------------------------------------------------------------------------------------------------------------------------------

  // TODO: Test Classes
  // TODO: Test Objects
])

describe('Wollok interpreter', () => {
  for (const [ast, expected] of fixture.entries()) {
    const result = () => interpret(ast)

    it(`should interpret ${JSON.stringify(ast)}`, () => {
      if (expected instanceof Error) expect(result).to.throw(expected.constructor, expected.message)
      else if (typeof expected === 'function') expect(escapeCode(result())).to.equal(escapeCode(expected))
      else expect(result(), `intepreting ${fixture}`).to.deep.equal(expected)
    })
  }

})

const escapeCode = (code) => code.toString().replace(/[\n\t ]/g, '', '')