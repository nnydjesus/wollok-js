import { expectScopeOf } from '../link-expects'
import { Class } from '../../../src/model'

describe('Class - variable resolution', () => {

  it('Class scope includes instance variables', () => {
    expectScopeOf(`
        class Bird {
          const energy = 23
        }
      `,
      Class, m => m.name === 'Bird',
      ['energy']
    )
  })

})