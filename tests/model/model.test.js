import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Variable, VariableDeclaration, Expression } from './../../dist/model'

const { is } = Object

describe('Model', () => {
  describe('Builders', () => {
    it('should print their name', () => {
      expect(Variable.toString()).to.equal('Variable')
    })
  })

  describe('Nodes', () => {

    describe('is', () => {

      const node = Variable('x')

      it('should return true if node belongs to given type', () => {
        expect(node.is(Variable)).to.be.true
      })

      it('should return true if node belongs to given type name', () => {
        expect(node.is('Variable')).to.be.true
      })

      it('should return true if node belongs to given category', () => {
        expect(node.is(Expression)).to.be.true
      })

      it('should return true if node belongs to given category string', () => {
        expect(node.is(Expression.toString())).to.be.true
      })

      it('should return false if node does not belong to given type', () => {
        expect(node.is(VariableDeclaration)).to.be.false
      })
    })

    describe('copy', () => {
      const node = Variable('x')

      it('should create an equal, non identical clone of the node if no diff is passed', () => {
        const clone = node.copy()
        expect(clone).to.deep.equal(node)
        expect(is(clone, node)).to.be.false
      })

      it('should replace the node state with the given diff values', () => {
        expect(node.copy({ name: 'y' })).to.deep.equal(Variable('y'))
      })

      it('should replace the node state with the given diff transformation applied to current value', () => {
        expect(node.copy({ name: prev => prev + prev })).to.deep.equal(Variable('xx'))
      })
    })

  })

})