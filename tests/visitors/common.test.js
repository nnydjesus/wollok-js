import { expect } from 'chai'
import { collect } from '../../src/visitors/commons'
import parser from '../../src/parser'

describe('common visitors', () => {

  describe('flatAttribute', () => {

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
})