import { expect } from 'chai'
import { visit } from '../../src/linker/visiting'
import parser from '../../src/parser'

describe('visitor', () => {

  describe('visit', () => {

    it('visits program and then its sentences', () => {
      const node = parser.parse(`
        program prueba {
          const a = 23
          const b = a
        }
      `)
      const visited = []
      visit(node, { enter(e) { visited.push(e.type) } })
      expect(visited).to.deep.equal([
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

    it('accepts an after and calls it after the children', () => {
      const node = parser.parse(`
        program prueba {
          const a = 23
        }
      `)
      const visited = []
      visit(node, { enter: () => {}, exit: e => visited.push(e.type) })
      expect(visited).to.deep.equal([
        'Variable',
        'Literal',
        'VariableDeclaration',
        'Block',
        'Program',
        'File'
      ])
    })
  })

})