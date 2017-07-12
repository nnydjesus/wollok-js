import { expect } from 'chai'
import { expectNoLinkageError, expectUnresolvedVariable, expectScopeOf } from '../link-expects'
import { link } from '../../../src/linker/link'
import parser from '../../../src/parser'
import { MethodDeclaration } from '../../../src/model'

describe('Method scoping', () => {

  describe('instance variables', () => {
    it('links a ref to a class instance variable', () => {
      const linked = link(parser.parse(`
        class Bird {
          var energy = 20
          method fly() {
            energy -= 1
          }
        }
      `))
      const Bird = linked.content[0]
      const energyInstVar = Bird.members.find(m => m.variable && m.variable.name === 'energy')
      const flyMethod = Bird.members.find(m => m.name === 'fly')
      const assignment = flyMethod.sentences.sentences[0]
      expect(assignment.variable.link).to.deep.equal(energyInstVar)
    })

    it('links a ref to an WKO instance variable', () => {
      expectNoLinkageError(`
        object pepita {
          var energy = 20
          method fly() {
            energy -= 1
          }
        }
      `)
    })
  })

  describe('params', () => {
    it('links a ref to a method parameter within an object', () => {
      expectNoLinkageError(`
        object pepita {
          method willConsume(meters) {
            return meters * 0.5
          }
        }
      `)
    })

    it('links a ref to a method parameter within a class', () => {
      expectNoLinkageError(`
        class Golondrina {
          method willConsume(meters) {
            return meters * 0.5
          }
        }
      `)
    })

    it('detects a wrong ref in a method', () => {
      expectUnresolvedVariable('meteoro', `
        object pepita {
          method willConsume(meters) {
            return meteoro * 0.5
          }
        }
      `)
    })
  })

  describe('local vars', () => {

    it('links a ref to a local variable within a method', () => {
      expectNoLinkageError(`
        object pepita {
          method willConsume(meters) {
            const factor = 23
            return meters * factor
          }
        }
      `)
    })

    it('detects a reference to a variable that is not yet declared', () => {
      expectUnresolvedVariable('factor', `
        object pepita {
          method willConsume(meters) {
            const result = meters * factor
            const factor = 0.5
            return result
          }
        }
      `)
    })

  })

  it('Method scope includes parameters', () => {
    expectScopeOf(`
        class Bird {
          const energy = 23
          method fly(kms) {
            energy -= kms
          }
        }
      `,
      MethodDeclaration, m => m.name === 'fly',
      ['kms']
    )
  })

})
