import { expectUnresolvedVariable, expectToBeLinkedToVariable } from '../link-expects'
import { link } from '../../../src/linker/linker'
import parse from '../../../src/parser'

describe('program', () => {

  it('links a simple Variable ref in a Program', () => {
    const linked = link(parse(`
      program prueba {
        const a = 23
        const b = a
      }
    `))
    const b = linked.content[0].sentences.sentences[1]
    expectToBeLinkedToVariable(b.value.name, 'a')
  })

  it('fails if a variable cannot be resolved in a program', () => {
    expectUnresolvedVariable('a', `
      program prueba {
        const b = a
      }
    `)
  })

})