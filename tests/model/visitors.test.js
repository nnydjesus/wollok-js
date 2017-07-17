import { expect } from 'chai'
import { visit } from '../../src/visitors/visiting'
import { Node } from '../../src/model'
import parser from '../../src/parser'

describe('visitor', () => {

  describe('visit', () => {

    it('traverse nodes in depth-first', () => {
      const node = Node('A')({
        b: Node('B')({
          b1: Node('B1')(),
          b2: Node('B2')()
        }),
        c: Node('C')({
          c1: Node('C1')(),
        }),
      })
      const visited = []
      visit(node, { enter(e) { visited.push(e.type) } })
      expect(visited).to.deep.equal([
        'A',
        'B',
        'B1',
        'B2',
        'C',
        'C1'
      ])
    })

    it('accepts an exit() function and calls it after the children', () => {
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

    it('passes the parent as 2nd parameter', () => {
      const node = Node('A')({
        b: Node('B')({
          b1: Node('B1')(),
          b2: Node('B2')()
        }),
        c: Node('C')({
          c1: Node('C1')(),
        }),
      })
      const relations = []
      visit(node, { enter(e, parent) { if (parent) relations.push(`${parent.type} > ${e.type}`) } })
      expect(relations).to.deep.equal([
        'A > B',
        'B > B1',
        'B > B2',
        'A > C',
        'C > C1'
      ])
    })
  })

})