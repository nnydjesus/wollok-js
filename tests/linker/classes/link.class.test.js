import { expect } from 'chai'
import { expectWrongLinkTypeAt, expectNoLinkageError, expectUnresolvedVariable, expectScopeHasNames } from '../link-expects'
import { link } from '../../../src/linker/linker'
import { Ref } from '../../../src/linker/steps/link'
import { queryNodeByType } from '../../../src/visitors/visiting'
import { New, Class, Mixin } from '../../../src/model'
import parse from '../../../src/parser'

describe('Class linkage', () => {

  it('File scope includes the classes', () => {
    expectScopeHasNames(link(parse(`
      class A {}
      class B {}
      class C {}
    `)), ['A', 'B', 'C'])
  })

  it('File scope includes the mixins, classes, and objects', () => {
    expectScopeHasNames(link(parse(`
      class A {}
      mixin M {}
      object c {}
    `)), ['A', 'M', 'c'])
  })

  describe('New', () => {

    it('gets linked to a class in the same file (declared BEFORE)', () => {
      const node = expectNoLinkageError(`
        class Bird {}
        class BirdFactory {
          method create() {
            return new Bird()
          }
        }
      `)
      const Bird = queryNodeByType(node, Class.name, c => c.name === 'Bird')[0]
      const niu = queryNodeByType(node, New.name)[0]
      expect(niu.target).to.deep.equal(Ref('Bird', Bird))
    })

    it('throws an error if the referenced class does NOT exist', () => {
      expectUnresolvedVariable('Bird', `
        class BirdFactory {
          method create() {
            return new Bird()
          }
        }
      `)
    })

    // TODO: finally I reached the point where the stack based linking 
    //   is not enough (or the deep-first approach)
    it('gets linked to a class in the same file (declared AFTER)', () => {
      expectNoLinkageError(`
        class BirdFactory {
          method create() {
            return new Bird()
          }
        }
        class Bird {}
      `)
    })

  })

  describe('Super (inherits)', () => {

    it('gets linked to a class in the same file (declared BEFORE)', () => {
      const node = expectNoLinkageError(`
        class Father { }
        class Son inherits Father { }
      `)
      const Father = queryNodeByType(node, Class.name, c => c.name === 'Father')[0]
      const Son = queryNodeByType(node, Class.name, s => s.name === 'Son')[0]
      expect(Son.superclass).to.deep.equal(Ref('Father', Father))
    })
    it('throws an error if the referenced class does NOT exist', () => {
      expectUnresolvedVariable('Father', `
        class Son inherits Father { }
      `, 'blah')
    })

    it('gets linked to a class in the same file (declared AFTER)', () => {
      expectNoLinkageError(`
        class Son inherits Father { }
        class Father { }
      `)
    })

  })

  describe('Mixins', () => {
    it('links a single mixins', () => {
      const node = expectNoLinkageError(`
        mixin M { }
        class C mixed with M { }
      `)
      const C = queryNodeByType(node, Class.name, c => c.name === 'C')[0]
      const M = queryNodeByType(node, Mixin.name, s => s.name === 'M')[0]
      expect(C.mixins).to.deep.equal([Ref('M', M)])
    })
    it('links MANY mixins (3)', () => {
      const node = expectNoLinkageError(`
        mixin M1 { }
        mixin M2 { }
        mixin M3 { }
        class C mixed with M1, M2, M3  { }
      `)
      const C = queryNodeByType(node, Class.name, c => c.name === 'C')[0]
      const M1 = queryNodeByType(node, Mixin.name, s => s.name === 'M1')[0]
      const M2 = queryNodeByType(node, Mixin.name, s => s.name === 'M2')[0]
      const M3 = queryNodeByType(node, Mixin.name, s => s.name === 'M3')[0]
      expect(C.mixins).to.deep.equal([Ref('M1', M1), Ref('M2', M2), Ref('M3', M3)])
    })
    it('links but detects an error if trying to use a class', () => {
      expectWrongLinkTypeAt(Class.name, 'mixins', `
        class M {}
        class C mixed with M {}
      `)
    })
  })


})