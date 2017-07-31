import {
  Assignment,
  Catch,
  Closure,
  List,
  Literal,
  New,
  Parameter,
  Reference,
  Send,
  Throw,
  Try,
  VariableDeclaration
} from '../src/model'
import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
import { interpreter, linker, parser } from '../src/index'

import also from 'chai-also'
import langNatives from '../dist/wre/lang.natives'
import { readFileSync } from 'fs'

chai.use(also)

const lang = linker(parser(readFileSync('src/wre/lang.wlk', 'utf8')))
const expectInterpretationOf = (...asts) => expect(interpreter(langNatives)(lang, ...asts))
const expectErrorOnInterpretationOf = (...asts) => ({
  to: {
    be(errorType, errorDescription) {
      expect(() => interpreter(langNatives)(lang, ...asts)).to.throw(errorType, errorDescription)
    }
  }
})

// const interpret = (...asts) => interpreter(langNatives)(lang, ...asts)

describe('Wollok interpreter', () => {

  describe('literals', () => {

    it('should interpret boolean literals as Booleans', () => {
      expectInterpretationOf(Literal(true))
        .to.have.nested.property('constructor.name', '$Boolean')
        .and.also.have.property('$inner', true)
    })

    it('should interpret string literals as $String', () => {
      expectInterpretationOf(Literal('foo'))
        .to.have.nested.property('constructor.name', '$String')
        .and.also.have.property('$inner', 'foo')
    })

    it('should interpret null literals as null', () => {
      expectInterpretationOf(Literal(null)).to.equal(null)
    })

    it('should interpret list literals as Lists', () => {
      expectInterpretationOf(List(Literal(1), Literal(2), Literal(3)))
        .to.satisfy(list => list.size().$inner === 3)
        .and.to.satisfy(list => list.get(0).$inner === 1)
        .and.to.satisfy(list => list.get(1).$inner === 2)
        .and.to.satisfy(list => list.get(2).$inner === 3)
    })

    describe('numbers', () => {

      it('should interpret round number literals as Integers', () => {
        expectInterpretationOf(Literal(5))
          .to.have.nested.property('constructor.name', 'Integer')
          .and.also.have.property('$inner', 5)
      })

      it('should interpret non-round number literals as Doubles', () => {
        expectInterpretationOf(Literal(5.7))
          .to.have.nested.property('constructor.name', 'Double')
          .and.also.have.property('$inner', 5.7)
      })

    })

    describe('closures', () => {

      it('should interpret closures without parameters', () => {
        expectInterpretationOf(
          Send(Closure()(Literal(5)), 'apply')()
        ).to.have.property('$inner', 5)
      })

      it('should interpret closures with parameters', () => {
        expectInterpretationOf(
          Send(Closure(Parameter('p'))(Reference('p')), 'apply')(Literal(5))
        ).to.have.property('$inner', 5)
      })

    })

  })

  describe('expressions', () => {

    describe('references', () => {

      it('should interpret declared references', () => {
        expectInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(5)),
          Reference('x')
        ).to.have.property('$inner', 5)
      })

      it('should interpret undeclared references', () => {
        expectErrorOnInterpretationOf(Reference('x')).to.be(ReferenceError, 'x is not defined')
      })

    })

    describe('try-catch-always', () => {

      it('should interpret non-failing tries with catches and no always clauses to be the try body result, ignoring catches', () => {
        expectInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(0)),
          Try(Assignment(Reference('x'), Literal(7)))(
            Catch(Reference('e'))(Assignment(Reference('x'), Literal(1)))
          )(),
          Reference('x')
        ).to.have.property('$inner', 7)
      })

      it('should interpret non-failing tries with catches and always clauses to be the always body result after executing the try body, ignoring catches', () => {
        expectInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(0)),
          Try(Assignment(Reference('x'), Literal(7)))(
            Catch(Reference('e'))(Assignment(Reference('x'), Literal(1)))
          )(Assignment(Reference('x'), Send(Reference('x'), '+')(Literal(1)))),
          Reference('x')
        ).to.have.property('$inner', 8)
      })

      it('should interpret non-failing tries with no catches and always clauses to be the always body result after executing the try body', () => {
        expectInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(0)),
          Try(Assignment(Reference('x'), Literal(7)))(
          )(Assignment(Reference('x'), Send(Reference('x'), '+')(Literal(1)))),
          Reference('x')
        ).to.have.property('$inner', 8)
      })

      it('should interpret failing tries with matching catch and no always clauses to be the catch result, ignoring try body after error', () => {
        expectInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(0)),
          Try(Throw(New('Exception')()), Assignment(Reference('x'), Literal(7)))(
            Catch(Reference('e'))(Assignment(Reference('x'), Send(Reference('x'), '+')(Literal(1))))
          )(),
          Reference('x')
        ).to.have.property('$inner', 1)
      })

      it('should interpret failing tries with matching catch and always clauses to be the catch result, ignoring try body after error but after executing the always', () => {
        expectInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(0)),
          Try(Throw(New('Exception')()), Assignment(Reference('x'), Literal(7)))(
            Catch(Reference('e'))(Assignment(Reference('x'), Send(Reference('x'), '*')(Literal(2))))
          )(Assignment(Reference('x'), Send(Reference('x'), '+')(Literal(1)))),
          Reference('x')
        ).to.have.property('$inner', 2)
      })

      it('should interpret failing tries with no catches and always clauses to propagate the error, ignoring try body after error but after executing the always', () => {
        expectErrorOnInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(0)),
          Try(Throw(New('Exception')()), Assignment(Reference('x'), Literal(7)))(
          )(Assignment(Reference('x'), Send(Reference('x'), '+')(Literal(1)))),
          Reference('x')
        ).to.be()
      })

      it('should interpret failing tries with no matching catches to propagate the error, ignoring try body after error', () => {
        expectErrorOnInterpretationOf(
          VariableDeclaration(Reference('x'), true, Literal(0)),
          Try(Throw(New('Exception')()), Assignment(Reference('x'), Literal(7)))(
            Catch(Reference('e'), 'StackOverflowException')(Assignment(Reference('x'), Literal(5)))
          )(),
          Reference('x')
        ).to.be()
      })

      it('should interpret failing tries with multiple matching catches to the result of the first one, ignoring try body after error', () => {
        expectInterpretationOf(
          VariableDeclaration(Reference('x')),
          Try(Throw(New('Exception')()), Assignment(Reference('x'), Literal(7)))(
            Catch(Reference('e'), 'StackOverflowException')(Assignment(Reference('x'), Literal(5))),
            Catch(Reference('e'), 'Exception')(Assignment(Reference('x'), Literal(2))),
            Catch(Reference('e'))(Assignment(Reference('x'), Literal(6)))
          )(),
          Reference('x')
        ).to.have.property('$inner', 2)
      })

    })

  })

  describe('sentences', () => {

    it('should interpret assignment of mutable variables', () => {
      expectInterpretationOf(
        VariableDeclaration(Reference('x'), true, Literal(1)),
        Assignment(Reference('x'), Send(Reference('x'), '+')(Literal(4))),
        Reference('x')
      ).to.have.property('$inner', 5)
    })

    it('should interpret assignment of immutable variables as an error', () => {
      expectErrorOnInterpretationOf(
        VariableDeclaration(Reference('x'), false, Literal(1)),
        Assignment(Reference('x'), Literal(5)),
        Reference('x')
      ).to.be(TypeError, 'Assignment to constant variable.')
    })

  })



  //-------------------------------------------------------------------------------------------------------------------------------
  // SENTENCES
  //-------------------------------------------------------------------------------------------------------------------------------
  // Not very useful tests, but at least serves to check it does not crash...


  // [Send(ClosureNode()(VariableDeclaration(Reference('x'), true), Reference('x')), 'call')(), null],
  // [Send(ClosureNode()(VariableDeclaration(Reference('x'), true, Literal(1)), Reference('x')), 'call')(), 1],
  // [Send(ClosureNode()(VariableDeclaration(Reference('x'), false, Literal(1)), Reference('x')), 'call')(), 1],

  // [Send(ClosureNode()(
  //   VariableDeclaration(Reference('x'), true, Literal(1)),
  //   Assignment(Reference('x'), Literal(2)),
  //   Reference('x')
  // ), 'call')(), 2],
  // [Assignment(Reference('x'), Literal(1)), new ReferenceError('a is not defined')],


  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS
  //-------------------------------------------------------------------------------------------------------------------------------

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