import { expect } from 'chai'
import { linkParent, link, LinkerError } from '../../src/linker/linker'
import parser from '../../src/parser'

describe('linker', () => {

  describe('linkParent', () => {

    it('does not link a basic object', () => {
      expect(linkParent('hola')).to.deep.equal('hola')
      expect(linkParent(23)).to.deep.equal(23)
      expect(true).to.deep.equal(true)
    })

    it('does not link a basic property', () => {
      expect(linkParent({
        name: 'pepe'
      })).to.deep.equal({ name: 'pepe' })
    })

    it('links a simple object property', () => {
      const r = linkParent({
        address: {
          street: 'evergreen'
        }
      })
      expect(r.address.parent).to.deep.equal(r)
    })

    it('links a two level nesting structure', () => {
      const r = linkParent({
        address: {
          city: {
            name: 'buenos aires'
          }
        }
      })
      expect(r.address.parent).to.deep.equal(r)
      expect(r.address.city.parent).to.deep.equal(r.address)
    })

    it('does not link an array of objects', () => {
      expect(linkParent([1, 2, 3])).to.deep.equal([1, 2, 3])
    })

    it('does not links an arrayed property with simple values', () => {
      expect(linkParent({ pets: [1, 2, 3] })).to.deep.equal({ pets: [1, 2, 3] })
    })

    it('does links an arrayed property with object values', () => {
      const parent = linkParent({
        pets: [{ name: 'boby' }, { name: 'sam' }, { name: 'uncle' }]
      })
      expect(parent.pets).to.deep.equal([
        { name: 'boby', parent }, { name: 'sam', parent }, { name: 'uncle', parent }
      ])
    })
  })

  describe('Linker', () => {

    const expectUnresolvedVariable = (variable, code) =>
      expect(() => link(parser.parse(code)))
        .to.throw(LinkerError, `Cannot resolve reference to '${variable}' at ???`)

    const expectNoLinkageError = code => link(parser.parse(code))

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

    describe('method scoping', () => {
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

  })

})