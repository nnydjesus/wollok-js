import { generate } from 'pegjs'
import { readFileSync } from 'fs'
import path from 'path'

const grammar = readFileSync(path.join(__dirname, 'grammar.pegjs'), 'utf8')
const ruleNames = grammar.match(/^\w+ +=/gm).map(ruleName => ruleName.slice(0, -2).trim())

export default generate(grammar, { allowedStartRules: ruleNames })