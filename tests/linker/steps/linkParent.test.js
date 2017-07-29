import { expect } from 'chai'

import { linkParentStep } from '../../../src/linker/steps/linkParent'
import { visit } from '../../../src/visitors/visiting'
import { node } from '../../../src/model'
import { expectParentToBeLinkedTo } from '../link-expects'

const linkParent = node => visit(linkParentStep)(node)

describe('linkParentStep', () => {

  it('does not link a basic object', () => {
    expect(linkParent('hola')).to.deep.equal('hola')
    expect(linkParent(23)).to.deep.equal(23)
    expect(linkParent(true)).to.deep.equal(true)
    expect(linkParent([1, 2, 3])).to.deep.equal([1, 2, 3])
  })

  it('does not link the Node/s basic properties', () => {
    expect(linkParent(node('root')({
      name: 'pepe',
      age: 23
    }))).to.deep.equal(node('root')({ name: 'pepe', age: 23 }))
  })

  it('links a Node within a Node', () => {
    const r = linkParent(node('root')({
      address: node('address')({
        street: 'evergreen'
      })
    }))
    expect(r.address.parent).not.to.be.undefined
    expect(r.address.parent.type).to.be.equal('root')
  })

  it('links a two level nesting Node structure', () => {
    const r = linkParent(node('root')({
      address: node('address')({
        city: node('city')({
          name: 'buenos aires'
        })
      })
    }))
    expectParentToBeLinkedTo(r.address, r)
    expectParentToBeLinkedTo(r.address.city, r.address)
  })

  describe('arrays properties', () => {

    it('are not linked if they have no Nodes', () => {
      expect(linkParent(node('root')({ list: [1, 2, 3] })))
        .to.deep.equal(node('root')({ list: [1, 2, 3] }))
    })

    it('with Nodes are linked', () => {
      const Pet = (name, parent) => node('pet')({ name, ...parent && { parent } })
      const parent = linkParent(node('person')({
        pets: [Pet('colita'), Pet('pelusa'), Pet('black')]
      }))
      expectParentToBeLinkedTo(parent.pets[0], parent)
      expectParentToBeLinkedTo(parent.pets[1], parent)
      expectParentToBeLinkedTo(parent.pets[2], parent)
    })

  })

})
