import { expect } from 'chai'

import { createPath } from '../../../src/linker/steps/createPaths'
import { visit } from '../../../src/visitors/visiting'
import { node } from '../../../src/model'
import { expectPath } from '../link-expects'

const doStep = node => visit(createPath)(node)

describe('creatPath', () => {

  it('does not process a basic object', () => {
    expect(doStep('hola')).to.deep.equal('hola')
    expect(doStep(23)).to.deep.equal(23)
    expect(doStep(true)).to.deep.equal(true)
    expect(doStep([1, 2, 3])).to.deep.equal([1, 2, 3])
  })

  it('does process the Node/s basic properties', () => {
    expect(doStep(node('root')({
      name: 'pepe',
      age: 23
    }))).to.deep.equal(node('root')({
      name: 'pepe',
      age: 23,
      path: ['root']
    }))
  })

  it('creates a path Node within a Node', () => {
    const r = doStep(node('root')({
      address: node('address')({
        street: 'evergreen'
      })
    }))
    expect(r.address.path).to.deep.equal(['root', 'address'])
  })

  it('creates a path on a Node within a Node within the root node', () => {
    const r = doStep(node('root')({
      address: node('address')({
        street: node('stree')({
          name: 'evergreen'
        })
      })
    }))
    expectPath(r, ['root'])
    expectPath(r.address, ['root', 'address'])
    expectPath(r.address.street, ['root', 'address', 'street'])
  })

  it('creates paths for nodes within an array property including the index', () => {
    const r = doStep(node('root')({
      pets: [
        node('pet')({ name: 'pelusa' }),
        node('pet')({ name: 'black' }),
        node('pet')({ name: 'aaron' }),
      ]
    }))
    expectPath(r.pets[0], ['root', 'pets[0]'])
    expectPath(r.pets[1], ['root', 'pets[1]'])
    expectPath(r.pets[2], ['root', 'pets[2]'])
  })

})
