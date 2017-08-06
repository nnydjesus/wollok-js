import { node as Node } from '../../src/model'
import { expect } from 'chai'
import { visit } from '../../src/visitors/visiting'

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
      visit({ enter(e) { visited.push(e.type) } })(node)
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
      const node = Node('R1')({
        c: Node('C1')({
          c1: Node('C1.1')({
            c1: Node('C1.1.1')({}),
            c2: Node('C1.1.2')({})
          }),
          c2: Node('C1.2')({
            cs: [
              Node('C1.2.1')({}),
              Node('C1.2.2')({}),
            ]
          })
        })
      })
      const visited = []

      visit({ enter: () => { }, exit: e => visited.push(e.type) })(node)

      expect(visited).to.deep.equal([
        'C1.1.1',
        'C1.1.2',
        'C1.1',
        'C1.2.1',
        'C1.2.2',
        'C1.2',
        'C1',
        'R1'
      ])
    })

    describe('context', () => {

      it('passes the parent as part of the context', () => {
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
        visit({ enter(e, { parent }) { if (parent) relations.push(`${parent.type} > ${e.type}`) } })(node)
        expect(relations).to.deep.equal([
          'A > B',
          'B > B1',
          'B > B2',
          'A > C',
          'C > C1'
        ])
      })

      it("passes a the parent node's feature name as part of the context", () => {
        const node = Node('A')({
          b: Node('B')({
            b1: Node('B1')(),
            b2: Node('B2')()
          }),
          c: Node('C')({
            c1: Node('C1')(),
          }),
        })
        const features = []
        visit({ enter(e, { parent, feature }) { if (parent) features.push(`${parent.type}.${feature}`) } })(node)
        expect(features).to.deep.equal([
          'A.b',
          'B.b1',
          'B.b2',
          'A.c',
          'C.c1'
        ])
      })

      it('passes the index if it is a member of an array property', () => {
        const node = Node('A')({
          b: [
            Node('B')({
              b1: Node('B1')(),
              b2: Node('B2')()
            }),
            Node('C')({
              c1: Node('C1')(),
            })
          ]
        })
        const features = []
        /* eslint prefer-template: 0 */
        visit({ enter(e, { feature, index }) { features.push(`${feature}${index !== undefined ? '[' + index + ']' : ''}`) } })(node)
        expect(features).to.deep.equal([
          'undefined',
          'b[0]',
          'b1',
          'b2',
          'b[1]',
          'c1'
        ])
      })

      it('passes the path of objects', () => {
        const node = Node('A')({
          b: [
            Node('B')({
              b1: Node('B1')(),
              b2: Node('B2')()
            }),
            Node('C')({
              c1: Node('C1')(),
            })
          ]
        })
        const features = []
        visit({ enter(e, { parents }) { features.push((parents || []).map(_ => _.type).join('.')) } })(node)
        expect(features).to.deep.equal([
          '',
          'A',
          'A.B',
          'A.B',
          'A',
          'A.C'
        ])
      })

    })

  })

})