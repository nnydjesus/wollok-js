import {
  Assignment,
  Catch,
  Class,
  Closure,
  Constructor,
  Field,
  File,
  If,
  Import,
  List,
  Literal,
  Method,
  Mixin,
  New,
  Package,
  Parameter,
  Program,
  Reference,
  Return,
  Send,
  Singleton,
  Super,
  Test,
  Throw,
  Try,
  VariableDeclaration
} from '../dist/model'
import { describe, it } from 'mocha'

import { expect } from 'chai'
import parse from './../dist/parser'

const FAIL = Symbol('FAIL')

const fixture = {

  //-------------------------------------------------------------------------------------------------------------------------------
  // BASICS
  //-------------------------------------------------------------------------------------------------------------------------------


  comment: {
    '// some comment': '',
    '// some comment\n': '',
    '/* some other comment*/': '',
    '/* non closed comment': FAIL,
  },

  _: {
    ' \
    // some comment \
    /* some other comment*/ \
    ': ' ',
  },

  __: {
    ' \
    // some comment \
    /* some other comment*/ \
    ': ' ',
  },

  id: {
    _foo123: '_foo123',
    '  foo': FAIL,
    4: FAIL
  },

  reference: {
    _foo123: Reference('_foo123'),
    '  foo': FAIL,
    4: FAIL,
    '=>': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // FILE
  //-------------------------------------------------------------------------------------------------------------------------------

  file: {
    ' // some comment \n import /* some other comment*/ p ': File(Import('p')),
  },

  import: {
    'import p': Import('p'),
    'import /* comment */ p': Import('p'),
    'import p.x': Import('p.x'),
    'import p.x.*': Import('p.x.*'),
    'import p.*.x': FAIL,
    import: FAIL
  },

  program: {
    'program name { }': Program('name')(),
    '  program name { }  ': Program('name')(),
    'program name { const x = a.m(1) }': Program('name')(VariableDeclaration(Reference('x'), false, Send(Reference('a'), 'm')(Literal(1)))),
    'program { }': FAIL,
    'program name { ': FAIL,
    'program name': FAIL
  },

  test: {
    'test "name" { }': Test(Literal('name'))(),
    'test "name" { const x = a.m(1) }': Test(Literal('name'))(VariableDeclaration(Reference('x'), false, Send(Reference('a'), 'm')(Literal(1)))),
    'test { }': FAIL,
    'test "name" { ': FAIL,
    'test "name"': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // LIBRARY ELEMENTS
  //-------------------------------------------------------------------------------------------------------------------------------

  package: {
    'package p {}': Package('p')(),
    'package p.q {}': Package('p.q')(),
    'package p.q { class C {} }': Package('p.q')(Class('C')()()),
    'package p.q { class C {} object O {} }': Package('p.q')(Class('C')()(), Singleton('O', [])()()),
    'package p. {}': FAIL,
    'package p': FAIL
  },

  class: {
    'class C { }': Class('C')()(),
    'class C { var v; method m() }': Class('C')()(Field(Reference('v'), true), Method('m')()()),
    'class C inherits p.S { var v; method m() }': Class('C')('p.S')(Field(Reference('v'), true), Method('m')()()),
    'class C inherits p.S mixed with p.M { }': Class('C')('p.S', 'p.M')(),
    'class C inherits p.S mixed with p.M { var v; method m() }': Class('C')('p.S', 'p.M')(Field(Reference('v'), true), Method('m')()()),
    'class C inherits p.S mixed with p.M and p.N { var v; method m() }': Class('C')('p.S', 'p.M', 'p.N')(Field(Reference('v'), true), Method('m')()()),
    'class C mixed with p.M and p.N { var v; method m() }': Class('C')('Object', 'p.M', 'p.N')(Field(Reference('v'), true), Method('m')()()),
    'class C { const a const b }': Class('C')()(Field(Reference('a'), false), Field(Reference('b'), false)),
    'class { var v; method m() }': FAIL,
    'class C': FAIL,
    'class C inherits p.S mixed with p.M': FAIL,
    'class C inherits p.S mixed with {}': FAIL,
    'class C inherits p.S mixed {}': FAIL,
    'class C inherits {}': FAIL,
    class: FAIL
  },

  mixin: {
    'mixin M { }': Mixin('M')(),
    'mixin M { var v; method m() }': Mixin('M')(Field(Reference('v'), true), Method('m')()()),
    'mixin { var v; method m() }': FAIL,
    'mixin { constructor() }': FAIL,
    'mixin M': FAIL,
    mixin: FAIL
  },

  namedObject: {
    'object O { }': Singleton('O')()(),
    'object O { var v; method m() }': Singleton('O')()(Field(Reference('v'), true), Method('m')()()),
    'object O inherits p.S { var v; method m() }': Singleton('O')('p.S')(Field(Reference('v'), true), Method('m')()()),
    'object O inherits p.S(a,b) { var v; method m() }': Singleton('O')('p.S', [Reference('a'), Reference('b')])(Field(Reference('v'), true), Method('m')()()),
    'object O inherits p.S mixed with p.M { var v; method m() }': Singleton('O')('p.S', [], 'p.M')(Field(Reference('v'), true), Method('m')()()),
    'object O inherits p.S mixed with p.M and p.N { var v; method m() }': Singleton('O')('p.S', [], 'p.M', 'p.N')(Field(Reference('v'), true), Method('m')()()),
    'object O mixed with p.M and p.N { var v; method m() }': Singleton('O')('Object', [], 'p.M', 'p.N')(Field(Reference('v'), true), Method('m')()()),
    'object { var v; method m() }': FAIL,
    'object O { constructor() }': FAIL,
    'object O': FAIL,
    'object O inherits p.S mixed with p.M': FAIL,
    'object O inherits p.S mixed with {}': FAIL,
    'object O inherits p.S mixed {}': FAIL,
    'object O inherits {}': FAIL,
    object: FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // MEMBERS
  //-------------------------------------------------------------------------------------------------------------------------------

  field: {
    'var _foo123': Field(Reference('_foo123'), true),
    'var _foo123 = b': Field(Reference('_foo123'), true, Reference('b')),
    'const _foo123': Field(Reference('_foo123'), false),
    'const _foo123 = b': Field(Reference('_foo123'), false, Reference('b')),
    var: FAIL,
    const: FAIL,
    'var 5': FAIL,
    'const 5': FAIL
  },

  method: {
    'method m()': Method('m')()(),
    'method m(p)': Method('m')(Parameter('p'))(),
    'method m(p,q)': Method('m')(Parameter('p'), Parameter('q'))(),
    'method m(p...)': Method('m')(Parameter('p', true))(),
    'method m(p,q...)': Method('m')(Parameter('p'), Parameter('q', true))(),
    'method m(p) { }': Method('m')(Parameter('p'))(),
    'method m(p) { p++ }': Method('m')(Parameter('p'))(Assignment(Reference('p'), Send(Reference('p'), '_++')())),
    'method m(p) = p++': Method('m')(Parameter('p'))(Assignment(Reference('p'), Send(Reference('p'), '_++')())),
    'override method m(p)': Method('m', true)(Parameter('p'))(),
    'override method m(p) native': Method('m', true, true)(Parameter('p'))(),
    'method m() = { a }': Method('m')()(Closure()(Reference('a'))),
    'method m(p...,q...)': FAIL,
    'method m(p...,q)': FAIL,
    'method m(p,q) =': FAIL,
    'method m(p,q) native = q': FAIL,
    'method m(p,q) native { }': FAIL
  },

  constructor: {
    'constructor()': Constructor()()(),
    'constructor () { }': Constructor()()(),
    'constructor(p)': Constructor(Parameter('p'))()(),
    'constructor(p, q)': Constructor(Parameter('p'), Parameter('q'))()(),
    'constructor(p...)': Constructor(Parameter('p', true))()(),
    'constructor(p, q...)': Constructor(Parameter('p'), Parameter('q', true))()(),
    'constructor(p) { p++ }': Constructor(Parameter('p'))()(Assignment(Reference('p'), Send(Reference('p'), '_++')())),
    'constructor(p) = self()': Constructor(Parameter('p'))([], false)(),
    'constructor(p) = self(p,p + 1)': Constructor(Parameter('p'))([Reference('p'), Send(Reference('p'), '+')(Literal(1))], false)(),
    'constructor(p) = self(p,p + 1) { p++ }': Constructor(Parameter('p'))([Reference('p'), Send(Reference('p'), '+')(Literal(1))], false)(Assignment(Reference('p'), Send(Reference('p'), '_++')())),
    'constructor(p) = super()': Constructor(Parameter('p'))([], true)(),
    'constructor(p) = super(p,p + 1)': Constructor(Parameter('p'))([Reference('p'), Send(Reference('p'), '+')(Literal(1))], true)(),
    'constructor(p) = super(p,p + 1) { p++ }': Constructor(Parameter('p'))([Reference('p'), Send(Reference('p'), '+')(Literal(1))], true)(Assignment(Reference('p'), Send(Reference('p'), '_++')())),
    'constructor': FAIL,
    'constructor(': FAIL,
    'constructor() = { }': FAIL,
    'constructor() = self': FAIL,
    'constructor() = super': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // SENTENCES
  //-------------------------------------------------------------------------------------------------------------------------------

  sentence: {
    '=>': FAIL,
    'class C {}': FAIL,
    'mixin M {}': FAIL,
    'object O {}': FAIL
  },

  variableDeclaration: {
    'var _foo123': VariableDeclaration(Reference('_foo123'), true),
    'const _foo123 = b': VariableDeclaration(Reference('_foo123'), false, Reference('b')),
    var: FAIL,
    const: FAIL,
    'var 5': FAIL,
    'const 5': FAIL
  },

  return: {
    'return e': Return(Reference('e')),
    return: FAIL
  },

  assignment: {
    'a = b': Assignment(Reference('a'), Reference('b')),
    'a += b': Assignment(Reference('a'), Send(Reference('a'), '+')(Reference('b'))),
    'a -= b': Assignment(Reference('a'), Send(Reference('a'), '-')(Reference('b'))),
    'a *= b': Assignment(Reference('a'), Send(Reference('a'), '*')(Reference('b'))),
    'a /= b': Assignment(Reference('a'), Send(Reference('a'), '/')(Reference('b'))),
    'a %= b': Assignment(Reference('a'), Send(Reference('a'), '%')(Reference('b'))),
    'a <<= b': Assignment(Reference('a'), Send(Reference('a'), '<<')(Reference('b'))),
    'a >>= b': Assignment(Reference('a'), Send(Reference('a'), '>>')(Reference('b'))),
    'a >>>= b': Assignment(Reference('a'), Send(Reference('a'), '>>>')(Reference('b'))),
    'a = b = c': FAIL,
    'a = b += c': FAIL,
    'a += b = c': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS: COMBINATED
  //-------------------------------------------------------------------------------------------------------------------------------

  orExpression: {
    'a || b': Send(Reference('a'), '||')(Reference('b')),
    'a or b': Send(Reference('a'), 'or')(Reference('b')),
    'a and b || !(c > d)': Send(Send(Reference('a'), 'and')(Reference('b')), '||')(Send(Send(Reference('c'), '>')(Reference('d')), '!_')())
  },

  andExpression: {
    'a && b': Send(Reference('a'), '&&')(Reference('b')),
    'a and b': Send(Reference('a'), 'and')(Reference('b')),
    'a == b && !(c and d)': Send(Send(Reference('a'), '==')(Reference('b')), '&&')(Send(Send(Reference('c'), 'and')(Reference('d')), '!_')())
  },

  equalityExpression: {
    'a == b': Send(Reference('a'), '==')(Reference('b')),
    'a != b': Send(Reference('a'), '!=')(Reference('b')),
    'a === b': Send(Reference('a'), '===')(Reference('b')),
    'a !== b': Send(Reference('a'), '!==')(Reference('b')),
    'a + x == -b * y': Send(Send(Reference('a'), '+')(Reference('x')), '==')(Send(Send(Reference('b'), '-_')(), '*')(Reference('y')))
  },

  orderExpression: {
    'a >= b': Send(Reference('a'), '>=')(Reference('b')),
    'a <= b': Send(Reference('a'), '<=')(Reference('b')),
    'a > b': Send(Reference('a'), '>')(Reference('b')),
    'a < b': Send(Reference('a'), '<')(Reference('b')),
    'a + x < -b * y': Send(Send(Reference('a'), '+')(Reference('x')), '<')(Send(Send(Reference('b'), '-_')(), '*')(Reference('y'))),
    'a instanceof': FAIL,
    'instanceof t': FAIL
  },

  otherOpExpression: {
    'a ..< b': Send(Reference('a'), '..<')(Reference('b')),
    'a >.. b': Send(Reference('a'), '>..')(Reference('b')),
    'a .. b': Send(Reference('a'), '..')(Reference('b')),
    'a -> b': Send(Reference('a'), '->')(Reference('b')),
    'a >>> b': Send(Reference('a'), '>>>')(Reference('b')),
    'a >> b': Send(Reference('a'), '>>')(Reference('b')),
    'a <<< b': Send(Reference('a'), '<<<')(Reference('b')),
    'a << b': Send(Reference('a'), '<<')(Reference('b')),
    'a <=> b': Send(Reference('a'), '<=>')(Reference('b')),
    'a <> b': Send(Reference('a'), '<>')(Reference('b')),
    'a ?: b': Send(Reference('a'), '?:')(Reference('b')),
    'a * -x <=> (b - y >> c)': Send(Send(Reference('a'), '*')(Send(Reference('x'), '-_')()), '<=>')(Send(Send(Reference('b'), '-')(Reference('y')), '>>')(Reference('c')))
  },

  additiveExpression: {
    'a + b': Send(Reference('a'), '+')(Reference('b')),
    'a - b': Send(Reference('a'), '-')(Reference('b')),
    'a +b -c': Send(Send(Reference('a'), '+')(Reference('b')), '-')(Reference('c')),
    'a + (b - c)': Send(Reference('a'), '+')(Send(Reference('b'), '-')(Reference('c'))),
    'a * -x + -(b - c)': Send(Send(Reference('a'), '*')(Send(Reference('x'), '-_')()), '+')(Send(Send(Reference('b'), '-')(Reference('c')), '-_')())
  },

  multiplicativeExpression: {
    'a * b': Send(Reference('a'), '*')(Reference('b')),
    'a ** b': Send(Reference('a'), '**')(Reference('b')),
    'a / b': Send(Reference('a'), '/')(Reference('b')),
    'a % b': Send(Reference('a'), '%')(Reference('b')),
    'a * b / c': Send(Send(Reference('a'), '*')(Reference('b')), '/')(Reference('c')),
    'a * (b / c)': Send(Reference('a'), '*')(Send(Reference('b'), '/')(Reference('c'))),
    'a++ * -(b / c)': Send(Assignment(Reference('a'), Send(Reference('a'), '_++')()), '*')(Send(Send(Reference('b'), '/')(Reference('c')), '-_')()),
    'a * (b + c)': Send(Reference('a'), '*')(Send(Reference('b'), '+')(Reference('c')))
  },

  prefixUnaryExpression: {
    'not a': Send(Reference('a'), 'not_')(),
    '!a': Send(Reference('a'), '!_')(),
    '-a': Send(Reference('a'), '-_')(),
    '+a': Send(Reference('a'), '+_')(),
    'not !a': Send(Send(Reference('a'), '!_')(), 'not_')(),
    '-a++': Send(Assignment(Reference('a'), Send(Reference('a'), '_++')()), '-_')(),
    '(-a)++': FAIL,
  },

  postfixUnaryExpression: {
    'a++': Assignment(Reference('a'), Send(Reference('a'), '_++')()),
    'a--': Assignment(Reference('a'), Send(Reference('a'), '_--')()),
    '(a--)++': FAIL
  },

  send: {
    'a.m()': Send(Reference('a'), 'm')(),
    'a.m(p)': Send(Reference('a'), 'm')(Reference('p')),
    'a.m{p => p}': Send(Reference('a'), 'm')(Closure(Parameter('p'))(Reference('p'))),
    'a.m(p, q)': Send(Reference('a'), 'm')(Reference('p'), Reference('q')),
    'a.m(p, q).n().o(r)': Send(Send(Send(Reference('a'), 'm')(Reference('p'), Reference('q')), 'n')(), 'o')(Reference('r')),
    '(a + 5).m(p, q)': Send(Send(Reference('a'), '+')(Literal(5)), 'm')(Reference('p'), Reference('q')),
    'a.m(p,)': FAIL,
    'a.m(,q)': FAIL,
    'a.m': FAIL,
    'a.': FAIL,
    '.m': FAIL,
    'm(p,q)': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS: PRIMARY
  //-------------------------------------------------------------------------------------------------------------------------------

  constructorCall: {
    'new p.C()': New('p.C')(),
    'new p.C(a)': New('p.C')(Reference('a')),
    'new p.C(a, b++)': New('p.C')(Reference('a'), Assignment(Reference('b'), Send(Reference('b'), '_++')())),
    'new p.C': FAIL,
    new: FAIL
  },

  superInvocation: {
    'super()': Super(),
    'super(a)': Super(Reference('a')),
    'super(a, b++)': Super(Reference('a'), Assignment(Reference('b'), Send(Reference('b'), '_++')())),
    super: FAIL,
    'super.m()': FAIL
  },

  ifExpression: {
    'if(a > b) x': If(Send(Reference('a'), '>')(Reference('b')))(Reference('x'))(),
    'if (a > b)x': If(Send(Reference('a'), '>')(Reference('b')))(Reference('x'))(),
    'if (a > b){x}': If(Send(Reference('a'), '>')(Reference('b')))(Reference('x'))(),
    'if (a > b){x;y}': If(Send(Reference('a'), '>')(Reference('b')))(Reference('x'), Reference('y'))(),
    'if (a > b) x else y': If(Send(Reference('a'), '>')(Reference('b')))(Reference('x'))(Reference('y')),
    'if (a > b) {x} else {y}': If(Send(Reference('a'), '>')(Reference('b')))(Reference('x'))(Reference('y')),
    'if (a > b){x}else{y}': If(Send(Reference('a'), '>')(Reference('b')))(Reference('x'))(Reference('y')),
    'if(a) if(b) x else y else z': If(Reference('a'))(If(Reference('b'))(Reference('x'))(Reference('y')))(Reference('z')),
    'if(a) if(b) x else y': If(Reference('a'))(If(Reference('b'))(Reference('x'))(Reference('y')))(),
    'if (a > b)xelse y': FAIL,
    'if a > b x else y': FAIL,
    'if (a > b) x else': FAIL,
    'if (a > b)': FAIL
  },

  tryExpression: {
    'try x++': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))()(),
    'try {x++}': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))()(),
    'try {x++} catch e h': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e'))(Reference('h')))(),
    'try {x++} catch e: foo.bar.E h': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e'), 'foo.bar.E')(Reference('h')))(),
    'try{ x++ }catch e{h}': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e'))(Reference('h')))(),
    'try{ x++ }catch e : foo.bar.E {h}': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e'), 'foo.bar.E')(Reference('h')))(),
    'try {x++} catch e{h} then always f': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e'))(Reference('h')))(Reference('f')),
    'try {x++} catch e{h} then always {f}': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e'))(Reference('h')))(Reference('f')),
    'try {x++} catch e1{h1} catch e2{h2}': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e1'))(Reference('h1')), Catch(Parameter('e2'))(Reference('h2')))(),
    'try {x++} catch e1{h1} catch e2{h2} then always {f}': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))(Catch(Parameter('e1'))(Reference('h1')), Catch(Parameter('e2'))(Reference('h2')))(Reference('f')),
    'try {x++} then always {f}': Try(Assignment(Reference('x'), Send(Reference('x'), '_++')()))()(Reference('f')),
    'try {x++} catch e{h} then always': FAIL,
    'try {x++} then always f then always f': FAIL,
    'try{ x++ }catch e': FAIL,
    'try{ x++ }catch{ h }': FAIL,
    'try{ x++': FAIL,
    try: FAIL,
    'catch e': FAIL
  },

  throwExpression: {
    'throw e': Throw(Reference('e')),
    throw: FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // LITERALS
  //-------------------------------------------------------------------------------------------------------------------------------

  literal: {
    true: Literal(true),
    false: Literal(false),
    null: Literal(null),
    1: Literal(1),
    10: Literal(10),
    '0x10': Literal(16),
    '10.50': Literal(10.50),
    '0x': FAIL,
    '10.': FAIL,
    '.50': FAIL,
    '"foo"': Literal('foo'),
    "'foo'": Literal('foo'),
    '""': Literal(''),
    '"foo\\nbar"': Literal('foo\\nbar'),
    '"foo\nbar"': Literal('foo\nbar'),
    '"foo\\xxx"': FAIL,
    '[]': List(),
    '[1]': List(Literal(1)),
    '[1,false,"foo"]': List(Literal(1), Literal(false), Literal('foo')),
    '#{1 + b, -5}': New('Set')(List(Send(Literal(1), '+')(Reference('b')), Send(Literal(5), '-_')())),
    '[': FAIL,
    '[1,2,': FAIL,
    '#{': FAIL,
    '#{1': FAIL,
    'object {}': Singleton()()(),
    'object { var v; method m() }': Singleton()()(Field(Reference('v'), true), Method('m')()()),
    'object inherits p.S { var v; method m() }': Singleton()('p.S')(Field(Reference('v'), true), Method('m')()()),
    'object inherits p.S(a,b) { var v; method m() }': Singleton()('p.S', [Reference('a'), Reference('b')])(Field(Reference('v'), true), Method('m')()()),
    'object inherits p.S mixed with p.M { var v; method m() }': Singleton()('p.S', [], 'p.M')(Field(Reference('v'), true), Method('m')()()),
    'object inherits p.S mixed with p.M and p.N { var v; method m() }': Singleton()('p.S', [], 'p.M', 'p.N')(Field(Reference('v'), true), Method('m')()()),
    'object mixed with p.M and p.N { var v; method m() }': Singleton()('Object', [], 'p.M', 'p.N')(Field(Reference('v'), true), Method('m')()()),
    'object { constructor() }': FAIL,
    'object inherits p.S mixed with p.M': FAIL,
    'object inherits p.S mixed with {}': FAIL,
    'object inherits p.S mixed {}': FAIL,
    'object inherits {}': FAIL,
    'object ': FAIL,
    '{}': Closure()(),
    '{ => }': Closure()(),
    '{ a.m() }': Closure()(Send(Reference('a'), 'm')()),
    '{ a => }': Closure(Parameter('a'))(),
    '{ a => a.m() }': Closure(Parameter('a'))(Send(Reference('a'), 'm')()),
    '{ a, b => a.m() }': Closure(Parameter('a'), Parameter('b'))(Send(Reference('a'), 'm')()),
    '{ a, b... => a.m() }': Closure(Parameter('a'), Parameter('b', true))(Send(Reference('a'), 'm')()),
    '{ a, b => a.m(); b }': Closure(Parameter('a'), Parameter('b'))(Send(Reference('a'), 'm')(), Reference('b')),
    '{ a, b a.m() }': FAIL
  }

}

describe('Wollok parser', () => {
  for (const grammar in fixture) {
    describe(grammar, () => {
      for (const source in fixture[grammar]) {
        const expected = fixture[grammar][source]
        const result = () => parse(source, { startRule: grammar })

        if (expected === FAIL) it(`should not parse: ${source}`, () => expect(result).to.throw())
        else it(`should parse: ${source} to: ${JSON.stringify(expected)}`, () => expect(result()).to.deep.equal(expected))
      }
    })
  }
})