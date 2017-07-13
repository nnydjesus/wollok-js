import { expectScopeOf } from '../link-expects'
import { Mixin } from '../../../src/model'

describe('Class scoping', () => {

  it('Mixin scope includes instance variables', () => {
    expectScopeOf(`
        mixin Bird {
          const energy = 23
        }
      `,
      Mixin, m => m.name === 'Bird',
      ['energy']
    )
  })

})