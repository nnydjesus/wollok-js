import { expect } from 'chai'
import { anySatisfy } from '../../src/utils/collections'

describe('Collection Utils', () => {

  describe('anySatisfy()', () => {

    it('should say true if one in the middle is true', () => {
      const persons = [
        { age: 10 },
        { age: 11 },
        { age: 20 },
        { age: 21 },
      ]
      expect(anySatisfy(persons, _ => _.age > 20)).to.equals(true)
    })

    it('should say false if none matches', () => {
      const persons = [
        { age: 10 },
        { age: 11 },
        { age: 20 },
        { age: 20 },
      ]
      expect(anySatisfy(persons, _ => _.age > 20)).to.equals(false)
    })

  })

})