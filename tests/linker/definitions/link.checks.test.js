import { expect } from 'chai'
import { Parameter, Field } from '../../../src/model'
import { or } from '../../../src/linker/types'
import { Ref } from '../../../src/linker/steps/link'

describe('Link checks', () => {

  describe('or()', () => {
    it('should say true for a ref of that type', () => {
      expect(or([Parameter])(Ref(Parameter('sarasa')))).to.equals(true)
    })
    it('should say false for a ref of another type', () => {
      expect(or([Parameter])(Ref(Field('sarasa')))).to.equals(false)
    })
    it('should say true for a ref of one of the types', () => {
      expect(or([Parameter, Field])(Ref(Field('sarasa')))).to.equals(true)
    })
    it('should say true for a ref of one of the types (first match)', () => {
      expect(or([Parameter, Field])(Ref(Parameter('sarasa')))).to.equals(true)
    })
  })

})