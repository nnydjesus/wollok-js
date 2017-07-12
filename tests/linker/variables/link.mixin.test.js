import { expectScopeOf } from '../link-expects'
import { MixinDeclaration } from '../../../src/model'

describe('Class scoping', () => {

  it('Mixin scope includes instance variables', () => {
    expectScopeOf(`
        mixin Bird {
          const energy = 23
        }
      `,
      MixinDeclaration, m => m.name === 'Bird',
      ['energy']
    )
  })

})