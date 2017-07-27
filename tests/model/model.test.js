import { Expression, Reference, VariableDeclaration } from './../../dist/model'
import { describe, it } from 'mocha'

import { expect } from 'chai'

const { is } = Object

describe('Model', () => {
  describe('Builders', () => {
    it('should print their name', () => {
      expect(Reference.toString()).to.equal('Reference')
    })
  })

  describe('Nodes', () => {

    describe('is', () => {

      const node = Reference('x')

      it('should return true if node belongs to given type', () => {
        expect(node.is(Reference)).to.be.true
      })

      it('should return true if node belongs to given type name', () => {
        expect(node.is('Reference')).to.be.true
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
      const node = Reference('x')

      it('should create an equal, non identical clone of the node if no diff is passed', () => {
        const clone = node.copy()
        expect(clone).to.deep.equal(node)
        expect(is(clone, node)).to.be.false
      })

      it('should replace the node state with the given diff values', () => {
        expect(node.copy({ name: 'y' })).to.deep.equal(Reference('y'))
      })

      it('should replace the node state with the given diff transformation applied to current value', () => {
        expect(node.copy({ name: prev => prev + prev })).to.deep.equal(Reference('xx'))
      })
    })

  })

})