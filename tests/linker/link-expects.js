import { expect } from 'chai'
import { unlinkParent } from '../../src/linker/steps/linkParent'
import { link } from '../../src/linker/linker'
import { collectErrors } from '../../src/linker/errors'
import { linkeables } from '../../src/linker/definitions'
import { queryNodeByType, visit } from '../../src/visitors/visiting'
import parse from '../../src/parser'

// expect utils for

export const expectToBeLinkedToVariable = (ref, varName) => {
  expect(ref.type).to.be.equal('Ref')
  expect(ref.node.type).to.be.equal('VariableDeclaration')
  expect(ref.node.variable.name).to.be.equal(varName)
}

export const expectNoLinkageError = code => {
  const n = link(parse(code))
  const errors = collectErrors(n)
  // console.log('>>>>>> ERRORS', errors)
  errors.forEach(e => visit(unlinkParent)(e.node))
  const errorsFound = errors.map(e => `${e.node.type}.${e.feature}: "${e.message}". ${e}`).join(', ')
  expect(errors.length, `Expecting no errors but found (${errors.length}): ${JSON.stringify(errorsFound)}`).to.be.equals(0)
  return n
}

export const expectParentToBeLinkedTo = (child, expectedParent) => {
  // this was original impl, but as the linker now "copies" the parent object,
  //  it doesn't have the children linked (within the parent "copy", so, we canno
  //  assert in this way !)
  // expect(child.parent).to.deep.equal(expectedParent)
  expect(child.parent).not.to.be.undefined
  // this is a poor assertion :(
  expect(child.parent.type).to.be.equals(expectedParent.type)
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

export const expectWrongLinkTypeAt = (type, feature, code, expectedTypeError) => {
  const n = link(parse(code))
  const errors = collectErrors(n)
  expect(errors.length).to.equals(1)
  expect(errors[0].feature).to.equals(feature)
  expect(errors[0].node.type).to.equals(type)
  expect(errors[0].message).to.equals(`Referencing a wrong type ${expectedTypeError}`)
}