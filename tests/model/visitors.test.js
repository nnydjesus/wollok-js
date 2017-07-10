import { expect } from 'chai'
import { visit } from '../../src/model/browsing'
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
      visit(node, e => visited.push(e.nodeType))
      expect(visited).to.deep.equal([
        'File',
        'Program',
        'VariableDeclaration',
        'Variable',
        'NumberLiteral',
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
      visit(node, () => {}, e => visited.push(e.nodeType))
      expect(visited).to.deep.equal([
        'Variable',
        'NumberLiteral',
        'VariableDeclaration',
        'Program',
        'File'
      ])
    })
  })

})