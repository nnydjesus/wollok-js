import { expect } from 'chai'
import { link } from '../../src/linker/link'
import { queryNodeByType } from '../../src/model/visiting'
import { ClassDeclaration, MethodDeclaration, Closure, MixinDeclaration } from '../../src/model'
import parser from '../../src/parser'

// expectations

const expectNoLinkageError = code => link(parser.parse(code))
const expectUnresolvedVariable = (variable, code) => expect(() =>
  link(parser.parse(code))
).to.throw(`Cannot resolve reference to '${variable}' at ???`)

const expectScopeHasNames = (node, expected) => expect(Object.keys(node.scope)).to.deep.equal(expected)
const expectScopeOf = (program, nodeType, findFilter, expected) => {
  expectScopeHasNames(
    queryNodeByType(link(parser.parse(program)), nodeType.name, findFilter)[0],
    expected
  )
}

// tests

describe('linker', () => {

  describe('Variable resolution', () => {

    describe('program', () => {

      it('links a simple Variable ref in a Program', () => {
        const linked = link(parser.parse(`
          program prueba {
            const a = 23
            const b = a
          }
        `))
        const [a, b] = linked.content[0].sentences
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

    describe('method scoping', () => {

      describe('instance variables', () => {
        it('links a ref to a class instance variable', () => {
          const linked = link(parser.parse(`
            class Bird {
              var energy = 20
              method fly() {
                energy -= 1
              }
            }
          `))
          const Bird = linked.content[0]
          const energyInstVar = Bird.members.find(m => m.variable && m.variable.name === 'energy')
          const flyMethod = Bird.members.find(m => m.name === 'fly')
          const assignment = flyMethod.sentences[0]
          expect(assignment.variable.link).to.deep.equal(energyInstVar)
        })

        it('links a ref to an WKO instance variable', () => {
          expectNoLinkageError(`
            object pepita {
              var energy = 20
              method fly() {
                energy -= 1
              }
            }
          `)
        })
      })

      describe('params', () => {
        it('links a ref to a method parameter within an object', () => {
          expectNoLinkageError(`
            object pepita {
              method willConsume(meters) {
                return meters * 0.5
              }
            }
          `)
        })

        it('links a ref to a method parameter within a class', () => {
          expectNoLinkageError(`
            class Golondrina {
              method willConsume(meters) {
                return meters * 0.5
              }
            }
          `)
        })

        it('detects a wrong ref in a method', () => {
          expectUnresolvedVariable('meteoro', `
            object pepita {
              method willConsume(meters) {
                return meteoro * 0.5
              }
            }
          `)
        })
      })

      describe('local vars', () => {

        it('links a ref to a local variable within a method', () => {
          expectNoLinkageError(`
            object pepita {
              method willConsume(meters) {
                const factor = 23
                return meters * factor
              }
            }
          `)
        })

        it('detects a reference to a variable that is not yet declared', () => {
          expectUnresolvedVariable('factor', `
            object pepita {
              method willConsume(meters) {
                const result = meters * factor
                const factor = 0.5
                return result
              }
            }
          `)
        })

      })

    })

    describe('closure scoping', () => {
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
    })

    describe('Nesting', () => {
      it('method => class(instance var)', () => {
        expectNoLinkageError(`
          class Bird {
            const energy = 23
            method fly(kms) {
              energy -= kms
            }
          }
        `)
      })
      it('closure => method(local + params) => class(instvars)', () => {
        expectNoLinkageError(`
          class Bird {
            const energy = 23
            method fly(kms) {
              const b = 23
              const closure = { a => b + kms + a + energy }
            }
          }
        `)
      })

      it('closure => program(local)', () => {
        expectNoLinkageError(`
          program p {
            const a = 23
            const closure = { b => a + b }
          }
        `)
      })

      it('closure => method(local + params) => object(instVar)', () => {
        expectNoLinkageError(`
          object pepita {
            const energy = 23
            method fly(kms) {
              const b = 23
              const closure = { a => b + kms + a + energy }
            }
          }
        `)
      })
    })

  })

  describe('Scoping', () => {

    it('Method scope includes parameters', () => {
      expectScopeOf(`
          class Bird {
            const energy = 23
            method fly(kms) {
              energy -= kms
            }
          }
        `,
        MethodDeclaration, m => m.name === 'fly',
        ['kms']
      )
    })

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

    it('Closure scope includes parameters', () => {
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

  describe('Class linkage', () => {

    it('File scope includes the classes', () => {
      expectScopeHasNames(link(parser.parse(`
        class A {}
        class B {}
        class C {}
      `)), ['A', 'B', 'C'])
    })
    it('File scope includes the mixins, classes, and objects', () => {
      expectScopeHasNames(link(parser.parse(`
        class A {}
        mixin M {}
        object c {}
      `)), ['A', 'M', 'c'])
    })

  })

})