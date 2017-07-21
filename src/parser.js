import { generate } from 'pegjs'
import { readFileSync } from 'fs'
import path from 'path'

let parser = null

try {
  const grammar = readFileSync(path.resolve('src/grammar.pegjs'), 'utf8')
  const ruleNames = grammar.match(/^[\w_]+ +=/gm).map(ruleName => ruleName.slice(0, -2).trim())

  parser = generate(grammar, { allowedStartRules: ruleNames })
} catch (error) {
  const grammar = 'grammar.js'
  parser = require(`./${grammar}`)
}

// const exportable = parser

export default parser.parse // exportable