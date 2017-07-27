import { chain, collect } from '../../src/visitors/commons'

import { expect } from 'chai'
import { node } from '../../src/model'
import parse from '../../src/parser'
import { visit } from '../../src/visitors/visiting'

describe('common visitors', () => {

  describe('collect', () => {
    it('collects all types', () => {
      const root = parse(`
        program prueba {
          const a = 23
          const b = a
        }
      `)
      const types = collect(root, n => n.type)
      expect(types).to.deep.equal([
        'File',
        'Program',
        'Block',
        'VariableDeclaration',
        'Reference',
        'Literal',
        'VariableDeclaration',
        'Reference',
        'Reference'
      ])
    })
  })
  describe('chain', () => {

    it('chains 2 visitors', () => {
      const first = { enter(n) { n.value += 1 } }
      const second = { enter(n) { n.value *= 2 } }

      const root = node('blah')({ value: 5 })
      visit(chain(first, second))(root)
      expect(root.value).to.be.equals(12)
    })

  })

})