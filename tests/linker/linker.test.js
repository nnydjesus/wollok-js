import { expect } from 'chai'
import { linkParent } from '../../src/linker/linker'

describe.only('linker', () => {

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