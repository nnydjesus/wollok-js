import { describe, it } from 'mocha'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'
import parser from './../../dist/parser'
import { link } from './../../dist/linker/linker'

describe('wdk', () => {
  const vm = fs.readFileSync(path.resolve('src/wdk/vm.wlk'), 'utf8')
  const lib = fs.readFileSync(path.resolve('src/wdk/vm.wlk'), 'utf8')
  const lang = fs.readFileSync(path.resolve('src/wdk/vm.wlk'), 'utf8')

  it('should be parseable and linkable', () => {
    expect(() => link(parser.parse(vm))).to.not.throw()
    expect(() => link(parser.parse(lib))).to.not.throw()
    expect(() => link(parser.parse(lang))).to.not.throw()
  })
})