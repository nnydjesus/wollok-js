import { expectNoLinkageError, expectUnresolvedVariable } from '../link-expects'

// RE ENABLE ALL THE SKIPPED ONCE THE PARSER FIXES CATCHES

describe('Try-catch scoping', () => {

  it.skip('resolves a reference to local variable inside the try', () => {
    expectNoLinkageError(`
      program p {
        try {
          var age = 23
          age = age + 1
        } catch e {
        }
      }
    `)
  })
  it.skip('resolves a reference to local variable inside the catch', () => {
    expectNoLinkageError(`
      program p {
        try {
        } catch e {
          var age = 23
          age = age + 1
        }
      }
    `)
  })
  it('resolves a reference to local variable inside the then always', () => {
    expectNoLinkageError(`
      program p {
        try {
        } then always {
          var age = 23
          age = age + 1
        }
      }
    `)
  })
  it.skip('resolves a reference to variable in the try parent scope from Try and Catch ', () => {
    expectNoLinkageError(`
      program p {
        var age = 23
        try {
          age = age + 1
        } catch e {
          age = age - 1
        }
      }
    `)
  })
  it('resolves a reference to variable in the try parent scope from ThenAlways ', () => {
    expectNoLinkageError(`
      program p {
        var age = 23
        try {
          age = age + 1
        } then always {
          age = age - 1
        }
      }
    `)
  })
  it('detects wrong reference from try to catch local variable', () => {
    expectUnresolvedVariable('age', `
      program p {
        try {
          age = age + 1
        } catch e {
          var age = 23
        }
      }
    `)
  })

})