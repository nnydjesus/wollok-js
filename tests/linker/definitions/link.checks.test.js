import { expect } from 'chai'
import { Parameter, Field } from '../../../src/model'
import { a, or, many } from '../../../src/linker/types'
import { Ref } from '../../../src/linker/steps/link'

describe('Link checks', () => {

  describe('a()', () => {
    it('should say true for a ref of that type', () => {
      expect(a(Parameter)(Ref('sarasa', Parameter('sarasa')))).to.equals(true)
    })
    it('should say false for a ref of another type', () => {
      expect(a(Parameter)(Ref('sarasa', Field('sarasa')))).to.equals(false)
    })
  })

  describe('many()', () => {
    it('should say true if all elements comply', () => {
      expect(many(Parameter)([Ref('p1', Parameter('p1')), Ref('p2', Parameter('p2'))])).to.equals(true)
    })
    it('should say false if none comply with the type', () => {
      expect(many(Parameter)([Ref('p1', Field('p1')), Ref('p2', Field('p2'))])).to.equals(false)
    })
    // this case is still like.. under-designed
    it('should say false if one of them does NOT comply', () => {
      expect(many(Parameter)([Ref('p1', Parameter('p1')), Ref('p2', Field('p2'))])).to.equals(false)
    })
  })

  describe('or()', () => {
    it('should say true for a ref of that type', () => {
      expect(or([Parameter])(Ref('sarasa', Parameter('sarasa')))).to.equals(true)
    })
    it('should say false for a ref of another type', () => {
      expect(or([Parameter])(Ref('sarasa', Field('sarasa')))).to.equals(false)
    })
    it('should say true for a ref of one of the types', () => {
      expect(or([Parameter, Field])(Ref('sarasa', Field('sarasa')))).to.equals(true)
    })
    it('should say true for a ref of one of the types (first match)', () => {
      expect(or([Parameter, Field])(Ref('sarasa', Parameter('sarasa')))).to.equals(true)
    })
  })

})