import { expect } from 'chai'
import { link, collectErrors } from '../../src/linker/linker'
import { linkeables } from '../../src/linker/definitions'
import { queryNodeByType } from '../../src/visitors/visiting'
import parse from '../../src/parser'

// expect utils for

export const expectNoLinkageError = code => {
  const n = link(parse(code))
  const errors = collectErrors(n)
  expect(errors.length).to.be.equals(0)
  return n
}

// THIS IMPL SUCKS !! It is really coupled with the current linkable Nodes !
// but I'm going out of vacations in a couple of hours !! aaaagggg
export const expectUnresolvedVariable = (variable, code) => {
  const n = link(parse(code))
  const errors = collectErrors(n)

  expect(errors.length).to.equals(1)
  const error = errors[0]

  expect(Object.keys(linkeables)).to.include(error.node.type)
  expect(error.ref).to.equals(variable)
  return n
}

export const expectScopeHasNames = (node, expected) => expect(Object.keys(node.scope)).to.deep.equal(expected)
export const expectScopeOf = (program, type, findFilter, expected) => {
  expectScopeHasNames(
    queryNodeByType(link(parse(program)), type.name, findFilter)[0],
    expected
  )
}