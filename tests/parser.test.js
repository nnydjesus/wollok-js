import { describe, it } from 'mocha'
import { expect } from 'chai'
import parser from '../src/parser'
import {
  Assignment,
  Catch,
  Class,
  Closure,
  Constructor,
  Send,
  Field,
  If,
  Import,
  InstanceOf,
  List,
  Method,
  Mixin,
  Singleton,
  New,
  Package,
  Parameter,
  Program,
  Return,
  Literal,
  Super,
  Test,
  Throw,
  Try,
  Variable,
  VariableDeclaration
} from '../src/model'

const FAIL = Symbol('FAIL')

const fixture = {

  //-------------------------------------------------------------------------------------------------------------------------------
  // BASICS
  //-------------------------------------------------------------------------------------------------------------------------------

  id: {
    _foo123: '_foo123',
    '  foo': FAIL,
    4: FAIL
  },

  variable: {
    _foo123: Variable('_foo123'),
    '  foo': FAIL,
    4: FAIL,
    '=>': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // FILE
  //-------------------------------------------------------------------------------------------------------------------------------

  import: {
    'import p': Import('p'),
    'import p.x': Import('p.x'),
    'import p.x.*': Import('p.x.*'),
    'import p.*.x': FAIL,
    import: FAIL
  },

  program: {
    'program name { }': Program('name')(),
    '  program name { }  ': Program('name')(),
    'program name { const x = a.m(1) }': Program('name')(VariableDeclaration(Variable('x'), false, Send(Variable('a'), 'm')(Literal(1)))),
    'program { }': FAIL,
    'program name { ': FAIL,
    'program name': FAIL
  },

  test: {
    'test "name" { }': Test(Literal('name'))(),
    'test "name" { const x = a.m(1) }': Test(Literal('name'))(VariableDeclaration(Variable('x'), false, Send(Variable('a'), 'm')(Literal(1)))),
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
    'class C { var v; method m() }': Class('C')()(Field(Variable('v'), true), Method('m')()()),
    'class C inherits p.S { var v; method m() }': Class('C')('p.S')(Field(Variable('v'), true), Method('m')()()),
    'class C inherits p.S mixed with p.M { }': Class('C')('p.S', 'p.M')(),
    'class C inherits p.S mixed with p.M { var v; method m() }': Class('C')('p.S', 'p.M')(Field(Variable('v'), true), Method('m')()()),
    'class C inherits p.S mixed with p.M and p.N { var v; method m() }': Class('C')('p.S', 'p.M', 'p.N')(Field(Variable('v'), true), Method('m')()()),
    'class C mixed with p.M and p.N { var v; method m() }': Class('C')('Object', 'p.M', 'p.N')(Field(Variable('v'), true), Method('m')()()),
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
    'mixin M { var v; method m() }': Mixin('M')(Field(Variable('v'), true), Method('m')()()),
    'mixin { var v; method m() }': FAIL,
    'mixin { constructor() }': FAIL,
    'mixin M': FAIL,
    mixin: FAIL
  },

  namedObject: {
    'object O { }': Singleton('O')()(),
    'object O { var v; method m() }': Singleton('O')()(Field(Variable('v'), true), Method('m')()()),
    'object O inherits p.S { var v; method m() }': Singleton('O')('p.S')(Field(Variable('v'), true), Method('m')()()),
    'object O inherits p.S(a,b) { var v; method m() }': Singleton('O')('p.S', [Variable('a'), Variable('b')])(Field(Variable('v'), true), Method('m')()()),
    'object O inherits p.S mixed with p.M { var v; method m() }': Singleton('O')('p.S', [], 'p.M')(Field(Variable('v'), true), Method('m')()()),
    'object O inherits p.S mixed with p.M and p.N { var v; method m() }': Singleton('O')('p.S', [], 'p.M', 'p.N')(Field(Variable('v'), true), Method('m')()()),
    'object O mixed with p.M and p.N { var v; method m() }': Singleton('O')('Object', [], 'p.M', 'p.N')(Field(Variable('v'), true), Method('m')()()),
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

  Field: {
    'var _foo123': Field(Variable('_foo123'), true),
    'const _foo123 = b': Field(Variable('_foo123'), false, Variable('b')),
    var: FAIL,
    const: FAIL,
    'var 5': FAIL,
    'const 5': FAIL
  },

  Method: {
    'method m()': Method('m')()(),
    'method m(p)': Method('m')(Parameter('p'))(),
    'method m(p,q)': Method('m')(Parameter('p'), Parameter('q'))(),
    'method m(p...)': Method('m')(Parameter('p', true))(),
    'method m(p,q...)': Method('m')(Parameter('p'), Parameter('q', true))(),
    'method m(p) { }': Method('m')(Parameter('p'))(),
    'method m(p) { p++ }': Method('m')(Parameter('p'))(Assignment(Variable('p'), Send(Variable('p'), '_++')())),
    'method m(p) = p++': Method('m')(Parameter('p'))(Assignment(Variable('p'), Send(Variable('p'), '_++')())),
    'override method m(p)': Method('m', true)(Parameter('p'))(),
    'override method m(p) native': Method('m', true, true)(Parameter('p'))(),
    'method m() = { a }': Method('m')()(Closure()(Variable('a'))),
    'method m(p...,q...)': FAIL,
    'method m(p...,q)': FAIL,
    'method m(p,q) =': FAIL,
    'method m(p,q) native = q': FAIL,
    'method m(p,q) native { }': FAIL
  },

  Constructor: {
    'constructor()': Constructor()()(),
    'constructor () { }': Constructor()()(),
    'constructor(p)': Constructor(Parameter('p'))()(),
    'constructor(p, q)': Constructor(Parameter('p'), Parameter('q'))()(),
    'constructor(p...)': Constructor(Parameter('p', true))()(),
    'constructor(p, q...)': Constructor(Parameter('p'), Parameter('q', true))()(),
    'constructor(p) { p++ }': Constructor(Parameter('p'))()(Assignment(Variable('p'), Send(Variable('p'), '_++')())),
    'constructor(p) = self()': Constructor(Parameter('p'))([], false)(),
    'constructor(p) = self(p,p + 1)': Constructor(Parameter('p'))([Variable('p'), Send(Variable('p'), '+')(Literal(1))], false)(),
    'constructor(p) = self(p,p + 1) { p++ }': Constructor(Parameter('p'))([Variable('p'), Send(Variable('p'), '+')(Literal(1))], false)(Assignment(Variable('p'), Send(Variable('p'), '_++')())),
    'constructor(p) = super()': Constructor(Parameter('p'))([], true)(),
    'constructor(p) = super(p,p + 1)': Constructor(Parameter('p'))([Variable('p'), Send(Variable('p'), '+')(Literal(1))], true)(),
    'constructor(p) = super(p,p + 1) { p++ }': Constructor(Parameter('p'))([Variable('p'), Send(Variable('p'), '+')(Literal(1))], true)(Assignment(Variable('p'), Send(Variable('p'), '_++')())),
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
    'var _foo123': VariableDeclaration(Variable('_foo123'), true),
    'const _foo123 = b': VariableDeclaration(Variable('_foo123'), false, Variable('b')),
    var: FAIL,
    const: FAIL,
    'var 5': FAIL,
    'const 5': FAIL
  },

  return: {
    'return e': Return(Variable('e')),
    return: FAIL
  },

  assignment: {
    'a = b': Assignment(Variable('a'), Variable('b')),
    'a += b': Assignment(Variable('a'), Send(Variable('a'), '+')(Variable('b'))),
    'a -= b': Assignment(Variable('a'), Send(Variable('a'), '-')(Variable('b'))),
    'a *= b': Assignment(Variable('a'), Send(Variable('a'), '*')(Variable('b'))),
    'a /= b': Assignment(Variable('a'), Send(Variable('a'), '/')(Variable('b'))),
    'a %= b': Assignment(Variable('a'), Send(Variable('a'), '%')(Variable('b'))),
    'a <<= b': Assignment(Variable('a'), Send(Variable('a'), '<<')(Variable('b'))),
    'a >>= b': Assignment(Variable('a'), Send(Variable('a'), '>>')(Variable('b'))),
    'a >>>= b': Assignment(Variable('a'), Send(Variable('a'), '>>>')(Variable('b'))),
    'a = b = c': FAIL,
    'a = b += c': FAIL,
    'a += b = c': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS: COMBINATED
  //-------------------------------------------------------------------------------------------------------------------------------

  orExpression: {
    'a || b': Send(Variable('a'), '||')(Variable('b')),
    'a or b': Send(Variable('a'), 'or')(Variable('b')),
    'a and b || !(c > d)': Send(Send(Variable('a'), 'and')(Variable('b')), '||')(Send(Send(Variable('c'), '>')(Variable('d')), '!_')())
  },

  andExpression: {
    'a && b': Send(Variable('a'), '&&')(Variable('b')),
    'a and b': Send(Variable('a'), 'and')(Variable('b')),
    'a == b && !(c and d)': Send(Send(Variable('a'), '==')(Variable('b')), '&&')(Send(Send(Variable('c'), 'and')(Variable('d')), '!_')())
  },

  equalityExpression: {
    'a == b': Send(Variable('a'), '==')(Variable('b')),
    'a != b': Send(Variable('a'), '!=')(Variable('b')),
    'a === b': Send(Variable('a'), '===')(Variable('b')),
    'a !== b': Send(Variable('a'), '!==')(Variable('b')),
    'a + x == -b * y': Send(Send(Variable('a'), '+')(Variable('x')), '==')(Send(Send(Variable('b'), '-_')(), '*')(Variable('y')))
  },

  orderExpression: {
    'a >= b': Send(Variable('a'), '>=')(Variable('b')),
    'a <= b': Send(Variable('a'), '<=')(Variable('b')),
    'a > b': Send(Variable('a'), '>')(Variable('b')),
    'a < b': Send(Variable('a'), '<')(Variable('b')),
    'a + x < -b * y': Send(Send(Variable('a'), '+')(Variable('x')), '<')(Send(Send(Variable('b'), '-_')(), '*')(Variable('y'))),
    'a instanceof p.C': InstanceOf(Variable('a'), 'p.C'),
    'a.m() instanceof p.C': InstanceOf(Send(Variable('a'), 'm')(), 'p.C'),
    'a instanceof': FAIL,
    'instanceof t': FAIL
  },

  otherOpExpression: {
    'a ..< b': Send(Variable('a'), '..<')(Variable('b')),
    'a >.. b': Send(Variable('a'), '>..')(Variable('b')),
    'a .. b': Send(Variable('a'), '..')(Variable('b')),
    'a -> b': Send(Variable('a'), '->')(Variable('b')),
    'a >>> b': Send(Variable('a'), '>>>')(Variable('b')),
    'a >> b': Send(Variable('a'), '>>')(Variable('b')),
    'a <<< b': Send(Variable('a'), '<<<')(Variable('b')),
    'a << b': Send(Variable('a'), '<<')(Variable('b')),
    'a <=> b': Send(Variable('a'), '<=>')(Variable('b')),
    'a <> b': Send(Variable('a'), '<>')(Variable('b')),
    'a ?: b': Send(Variable('a'), '?:')(Variable('b')),
    'a * -x <=> (b - y >> c)': Send(Send(Variable('a'), '*')(Send(Variable('x'), '-_')()), '<=>')(Send(Send(Variable('b'), '-')(Variable('y')), '>>')(Variable('c')))
  },

  additiveExpression: {
    'a + b': Send(Variable('a'), '+')(Variable('b')),
    'a - b': Send(Variable('a'), '-')(Variable('b')),
    'a +b -c': Send(Send(Variable('a'), '+')(Variable('b')), '-')(Variable('c')),
    'a + (b - c)': Send(Variable('a'), '+')(Send(Variable('b'), '-')(Variable('c'))),
    'a * -x + -(b - c)': Send(Send(Variable('a'), '*')(Send(Variable('x'), '-_')()), '+')(Send(Send(Variable('b'), '-')(Variable('c')), '-_')())
  },

  multiplicativeExpression: {
    'a * b': Send(Variable('a'), '*')(Variable('b')),
    'a ** b': Send(Variable('a'), '**')(Variable('b')),
    'a / b': Send(Variable('a'), '/')(Variable('b')),
    'a % b': Send(Variable('a'), '%')(Variable('b')),
    'a * b / c': Send(Send(Variable('a'), '*')(Variable('b')), '/')(Variable('c')),
    'a * (b / c)': Send(Variable('a'), '*')(Send(Variable('b'), '/')(Variable('c'))),
    'a++ * -(b / c)': Send(Assignment(Variable('a'), Send(Variable('a'), '_++')()), '*')(Send(Send(Variable('b'), '/')(Variable('c')), '-_')()),
    'a * (b + c)': Send(Variable('a'), '*')(Send(Variable('b'), '+')(Variable('c')))
  },

  prefixUnaryExpression: {
    'not a': Send(Variable('a'), 'not_')(),
    '!a': Send(Variable('a'), '!_')(),
    '-a': Send(Variable('a'), '-_')(),
    '+a': Send(Variable('a'), '+_')(),
    'not !a': Send(Send(Variable('a'), '!_')(), 'not_')(),
    '-a++': Send(Assignment(Variable('a'), Send(Variable('a'), '_++')()), '-_')(),
    '(-a)++': FAIL,
  },

  postfixUnaryExpression: {
    'a++': Assignment(Variable('a'), Send(Variable('a'), '_++')()),
    'a--': Assignment(Variable('a'), Send(Variable('a'), '_--')()),
    '(a--)++': FAIL
  },

  send: {
    'a.m()': Send(Variable('a'), 'm')(),
    'a.m(p)': Send(Variable('a'), 'm')(Variable('p')),
    'a.m{p => p}': Send(Variable('a'), 'm')(Closure(Parameter('p'))(Variable('p'))),
    'a.m(p, q)': Send(Variable('a'), 'm')(Variable('p'), Variable('q')),
    'a.m(p, q).n().o(r)': Send(Send(Send(Variable('a'), 'm')(Variable('p'), Variable('q')), 'n')(), 'o')(Variable('r')),
    '(a + 5).m(p, q)': Send(Send(Variable('a'), '+')(Literal(5)), 'm')(Variable('p'), Variable('q')),
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
    'new p.C(a)': New('p.C')(Variable('a')),
    'new p.C(a, b++)': New('p.C')(Variable('a'), Assignment(Variable('b'), Send(Variable('b'), '_++')())),
    'new p.C': FAIL,
    new: FAIL
  },

  superInvocation: {
    'super()': Super(),
    'super(a)': Super(Variable('a')),
    'super(a, b++)': Super(Variable('a'), Assignment(Variable('b'), Send(Variable('b'), '_++')())),
    super: FAIL,
    'super.m()': FAIL
  },

  ifExpression: {
    'if(a > b) x': If(Send(Variable('a'), '>')(Variable('b')))(Variable('x'))(),
    'if (a > b)x': If(Send(Variable('a'), '>')(Variable('b')))(Variable('x'))(),
    'if (a > b){x}': If(Send(Variable('a'), '>')(Variable('b')))(Variable('x'))(),
    'if (a > b){x;y}': If(Send(Variable('a'), '>')(Variable('b')))(Variable('x'), Variable('y'))(),
    'if (a > b) x else y': If(Send(Variable('a'), '>')(Variable('b')))(Variable('x'))(Variable('y')),
    'if (a > b) {x} else {y}': If(Send(Variable('a'), '>')(Variable('b')))(Variable('x'))(Variable('y')),
    'if (a > b){x}else{y}': If(Send(Variable('a'), '>')(Variable('b')))(Variable('x'))(Variable('y')),
    'if(a) if(b) x else y else z': If(Variable('a'))(If(Variable('b'))(Variable('x'))(Variable('y')))(Variable('z')),
    'if(a) if(b) x else y': If(Variable('a'))(If(Variable('b'))(Variable('x'))(Variable('y')))(),
    'if (a > b)xelse y': FAIL,
    'if a > b x else y': FAIL,
    'if (a > b) x else': FAIL,
    'if (a > b)': FAIL
  },

  tryExpression: {
    'try x++': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))()(),
    'try {x++}': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))()(),
    'try {x++} catch e h': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e'))(Variable('h')))(),
    'try {x++} catch e: foo.bar.E h': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e'), 'foo.bar.E')(Variable('h')))(),
    'try{ x++ }catch e{h}': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e'))(Variable('h')))(),
    'try{ x++ }catch e : foo.bar.E {h}': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e'), 'foo.bar.E')(Variable('h')))(),
    'try {x++} catch e{h} then always f': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e'))(Variable('h')))(Variable('f')),
    'try {x++} catch e{h} then always {f}': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e'))(Variable('h')))(Variable('f')),
    'try {x++} catch e1{h1} catch e2{h2}': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e1'))(Variable('h1')), Catch(Variable('e2'))(Variable('h2')))(),
    'try {x++} catch e1{h1} catch e2{h2} then always {f}': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))(Catch(Variable('e1'))(Variable('h1')), Catch(Variable('e2'))(Variable('h2')))(Variable('f')),
    'try {x++} then always {f}': Try(Assignment(Variable('x'), Send(Variable('x'), '_++')()))()(Variable('f')),
    'try {x++} catch e{h} then always': FAIL,
    'try {x++} then always f then always f': FAIL,
    'try{ x++ }catch e': FAIL,
    'try{ x++ }catch{ h }': FAIL,
    'try{ x++': FAIL,
    try: FAIL,
    'catch e': FAIL
  },

  throwExpression: {
    'throw e': Throw(Variable('e')),
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
    '#{1 + b, -5}': New('Set')(List(Send(Literal(1), '+')(Variable('b')), Send(Literal(5), '-_')())),
    '[': FAIL,
    '[1,2,': FAIL,
    '#{': FAIL,
    '#{1': FAIL,
    'object {}': Singleton()()(),
    'object { var v; method m() }': Singleton()()(Field(Variable('v'), true), Method('m')()()),
    'object inherits p.S { var v; method m() }': Singleton()('p.S')(Field(Variable('v'), true), Method('m')()()),
    'object inherits p.S(a,b) { var v; method m() }': Singleton()('p.S', [Variable('a'), Variable('b')])(Field(Variable('v'), true), Method('m')()()),
    'object inherits p.S mixed with p.M { var v; method m() }': Singleton()('p.S', [], 'p.M')(Field(Variable('v'), true), Method('m')()()),
    'object inherits p.S mixed with p.M and p.N { var v; method m() }': Singleton()('p.S', [], 'p.M', 'p.N')(Field(Variable('v'), true), Method('m')()()),
    'object mixed with p.M and p.N { var v; method m() }': Singleton()('Object', [], 'p.M', 'p.N')(Field(Variable('v'), true), Method('m')()()),
    'object { constructor() }': FAIL,
    'object inherits p.S mixed with p.M': FAIL,
    'object inherits p.S mixed with {}': FAIL,
    'object inherits p.S mixed {}': FAIL,
    'object inherits {}': FAIL,
    'object ': FAIL,
    '{}': Closure()(),
    '{ => }': Closure()(),
    '{ a.m() }': Closure()(Send(Variable('a'), 'm')()),
    '{ a => }': Closure(Parameter('a'))(),
    '{ a => a.m() }': Closure(Parameter('a'))(Send(Variable('a'), 'm')()),
    '{ a, b => a.m() }': Closure(Parameter('a'), Parameter('b'))(Send(Variable('a'), 'm')()),
    '{ a, b... => a.m() }': Closure(Parameter('a'), Parameter('b', true))(Send(Variable('a'), 'm')()),
    '{ a, b => a.m(); b }': Closure(Parameter('a'), Parameter('b'))(Send(Variable('a'), 'm')(), Variable('b')),
    '{ a, b a.m() }': FAIL
  }

}

describe('Wollok parser', () => {
  for (const grammar in fixture) {
    describe(grammar, () => {
      for (const source in fixture[grammar]) {
        const expected = fixture[grammar][source]
        const result = () => parser.parse(source, { startRule: grammar })

        if (expected === FAIL) it(`should not parse: ${source}`, () => expect(result).to.throw())
        else it(`should parse: ${source} to: ${JSON.stringify(expected)}`, () => expect(result()).to.deep.equal(expected))
      }
    })
  }
})