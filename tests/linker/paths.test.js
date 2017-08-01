import { expect } from 'chai'
import { resolvePath, parsePathPart } from '../../src/linker/scoping'
import { node } from '../../src/model'

describe('resolvePath', () => {

  it('resolves a simple field access', () => {
    const n = node('person')({
      pet: node('pet', {
        name: 'black'
      })
    })
    expect(resolvePath(n, ['root', 'pet'])).to.deep.equal(n.pet)
  })

  it('resolves a nested path', () => {
    const n = node('address')({
      city: node('city')({
        name: 'bs as',
        capital: node('capital')({
          population: 100
        })
      })
    })
    expect(resolvePath(n, ['root', 'city', 'capital'])).to.deep.equal(n.city.capital)
  })

  it('resolves a path to an array element.only', () => {
    const n = node('person')({
      pets: [
        node('pet', { name: 'pelusa' }),
        node('pet', { name: 'black' }),
      ]
    })
    expect(resolvePath(n, ['root', 'pets[0]'])).to.deep.equal(n.pets[0])
    expect(resolvePath(n, ['root', 'pets[1]'])).to.deep.equal(n.pets[1])
  })

  it('resolves a path to an array element as a nested path', () => {
    const n = node('system')({
      persons: [
        node('person')({
          name: 'Arturo',
          pets: [
            node('pet', { name: 'pelusa' }),
            node('pet', { name: 'black' }),
          ]
        }),
        node('person')({
          name: 'Illia',
          pets: [
            node('pet', { name: 'gaturro' }),
            node('pet', { name: 'garfield' }),
          ]
        })
      ]
    })
    expect(resolvePath(n, ['root', 'persons[0]', 'pets[0]'])).to.deep.equal(n.persons[0].pets[0])
    expect(resolvePath(n, ['root', 'persons[0]', 'pets[1]'])).to.deep.equal(n.persons[0].pets[1])
    expect(resolvePath(n, ['root', 'persons[1]', 'pets[0]'])).to.deep.equal(n.persons[1].pets[0])
    expect(resolvePath(n, ['root', 'persons[1]', 'pets[1]'])).to.deep.equal(n.persons[1].pets[1])
  })

  describe('regexp for path (parsePathPart)', () => {

    it('parses a simple property', () => {
      expect(parsePathPart('hola')).to.deep.equals({
        feature: 'hola'
      })
    })

    it('parses a simple property with upperCase', () => {
      expect(parsePathPart('thenSentences')).to.deep.equals({
        feature: 'thenSentences'
      })
    })

    it('parses an indexed property', () => {
      expect(parsePathPart('hola[2]')).to.deep.equals({
        feature: 'hola',
        index: 2
      })
    })

  })

})