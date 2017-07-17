import { expect } from 'chai'
import { Node } from '../../src/model'
import { visit } from '../../src/visitors/visiting'
import { collect, chain } from '../../src/visitors/commons'
import parser from '../../src/parser'

describe('common visitors', () => {

  describe('collect', () => {
    it('collects all types', () => {
      const node = parser.parse(`
        program prueba {
          const a = 23
          const b = a
        }
      `)
      const types = collect(node, n => n.type)
      expect(types).to.deep.equal([
        'File',
        'Program',
        'Block',
        'VariableDeclaration',
        'Variable',
        'Literal',
        'VariableDeclaration',
        'Variable',
        'Variable'
      ])
    })
  })
  describe('chain', () => {

    it('chains 2 visitors', () => {
      const first = { enter(n) { n.value += 1 } }
      const second = { enter(n) { n.value *= 2 } }

      const node = Node('blah')({ value: 5 })
      visit(node, chain(first, second))
      expect(node.value).to.be.equals(12)
    })

  })

})