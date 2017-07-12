import { expectNoLinkageError, expectUnresolvedVariable, expectScopeOf } from '../link-expects'
import { Closure } from '../../../src/model'

describe('Closure scoping', () => {
  it('resolves a reference to a closure parameter', () => {
    expectNoLinkageError(`
      program p {
        const calculus = { a => a * 2 }
      }
    `)
  })
  it('detects wrong reference in a closure', () => {
    expectUnresolvedVariable('b', `
      program p {
        const calculus = { a => b * 2 }
      }
    `)
  })

  it('scope includes parameters', () => {
    expectScopeOf(`
        class Bird {
          const energy = 23
          method fly() {
            const closure = { name, lastName => name + lastName }
            return closure.apply('john', 'doe')
          }
        }
      `,
      Closure, () => true,
      ['name', 'lastName']
    )
  })

})