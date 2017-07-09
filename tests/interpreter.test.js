import path from 'path'
import { describe, it } from 'mocha'
import { readFileSync } from 'fs'
import parser from '../src/parser'
import interpret from '../src/interpreter'

describe('Wollok interpreter', () => {

  it('should work', () => {
    const file = readFileSync(path.join(__dirname, 'examples/golondrina.wollok'), 'utf8')
    const ast = parser.parse(file)

    console.log(interpret(ast))
  })
})