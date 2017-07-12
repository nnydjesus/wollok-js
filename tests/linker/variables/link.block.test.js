import { expectNoLinkageError, expectUnresolvedVariable } from '../link-expects'

describe('Block scoping', () => {

  describe('If', () => {
    it('resolves a local variable on the positive side block', () => {
      expectNoLinkageError(`
        program p {
          if (true) {
            const a = 1
            const b = a + 1
          }
        }
      `)
    })
    it('detects wrong reference from the ELSE side to the IF positive side', () => {
      expectUnresolvedVariable('b', `
        program p {
          const edad = 23
          if (edad > 40) {
            const b = edad + 2
          }
          else {
            const c = edad + b
          }
        }
      `)
    })
    it('detects wrong reference from the IF positive side to the ELSE positive side', () => {
      expectUnresolvedVariable('c', `
        program p {
          if (true) {
            const b = c + 2
          }
          else {
            const c = 2
          }
        }
      `)
    })

    it('resolves a local variable on the parent scope from ELSE and IF positive sides', () => {
      expectNoLinkageError(`
        program p {
          const edad = 23
          if (edad > 40) {
            const b = edad + 2
          }
          else {
            const c = edad + 2
          }
        }
      `)
    })
    
  })

})