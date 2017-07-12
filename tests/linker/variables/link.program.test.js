import { expect } from 'chai'
import { expectUnresolvedVariable } from '../link-expects'
import { link } from '../../../src/linker/link'
import parser from '../../../src/parser'

describe('program', () => {

  it('links a simple Variable ref in a Program', () => {
    const linked = link(parser.parse(`
      program prueba {
        const a = 23
        const b = a
      }
    `))
    const [a, b] = linked.content[0].sentences.sentences
    expect(b.value.link).to.deep.equal(a)
  })

  it('fails if a variable cannot be resolved in a program', () => {
    expectUnresolvedVariable('a', `
      program prueba {
        const b = a
      }
    `)
  })

})