import { expectUnresolvedVariable, expectToBeLinkedTo } from '../link-expects'
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
    const [a, b] = linked.content[0].sentences.sentences
    expectToBeLinkedTo(b.value.name, a)
  })

  it('fails if a variable cannot be resolved in a program', () => {
    expectUnresolvedVariable('a', `
      program prueba {
        const b = a
      }
    `)
  })

})