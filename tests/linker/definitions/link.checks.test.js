import { expect } from 'chai'
import { Parameter, Field, node as Node } from '../../../src/model'
import { a, or, many } from '../../../src/linker/types'

const ResolvedLink = (token, node) => Node('ResolvedLink')({ token, node })

describe('Link checks', () => {

  describe('a()', () => {
    it('should say true for a ref of that type', () => {
      expect(a(Parameter)(ResolvedLink('sarasa', Parameter('sarasa')))).to.equals(true)
    })
    it('should say false for a ref of another type', () => {
      expect(a(Parameter)(ResolvedLink('sarasa', Field('sarasa')))).to.equals(false)
    })
  })

  describe('many()', () => {
    it('should say true if all elements comply', () => {
      expect(many(Parameter)([ResolvedLink('p1', Parameter('p1')), ResolvedLink('p2', Parameter('p2'))])).to.equals(true)
    })
    it('should say false if none comply with the type', () => {
      expect(many(Parameter)([ResolvedLink('p1', Field('p1')), ResolvedLink('p2', Field('p2'))])).to.equals(false)
    })
    // this case is still like.. under-designed
    it('should say false if one of them does NOT comply', () => {
      expect(many(Parameter)([ResolvedLink('p1', Parameter('p1')), ResolvedLink('p2', Field('p2'))])).to.equals(false)
    })
  })

  describe('or()', () => {
    it('should say true for a ref of that type', () => {
      expect(or([Parameter])(ResolvedLink('sarasa', Parameter('sarasa')))).to.equals(true)
    })
    it('should say false for a ref of another type', () => {
      expect(or([Parameter])(ResolvedLink('sarasa', Field('sarasa')))).to.equals(false)
    })
    it('should say true for a ref of one of the types', () => {
      expect(or([Parameter, Field])(ResolvedLink('sarasa', Field('sarasa')))).to.equals(true)
    })
    it('should say true for a ref of one of the types (first match)', () => {
      expect(or([Parameter, Field])(ResolvedLink('sarasa', Parameter('sarasa')))).to.equals(true)
    })
  })

})