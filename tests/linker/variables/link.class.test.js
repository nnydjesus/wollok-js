import { expectScopeOf } from '../link-expects'
import { ClassDeclaration } from '../../../src/model'

describe('Class - variable resolution', () => {

  it('Class scope includes instance variables', () => {
    expectScopeOf(`
        class Bird {
          const energy = 23
        }
      `,
      ClassDeclaration, m => m.name === 'Bird',
      ['energy']
    )
  })

})