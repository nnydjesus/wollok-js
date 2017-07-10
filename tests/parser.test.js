import { describe, it } from 'mocha'
import { expect } from 'chai'
import parser from '../src/parser'
import {
  Assignment,
  BinaryOp,
  BooleanLiteral,
  Catch,
  ClassDeclaration,
  Closure,
  ConstructorDeclaration,
  FeatureCall,
  If,
  Import,
  InstanceOf,
  ListLiteral,
  MethodDeclaration,
  MixinDeclaration,
  ObjectDeclaration,
  New,
  NullLiteral,
  NumberLiteral,
  Package,
  Parameter,
  Program,
  Return,
  SelfLiteral,
  SetLiteral,
  StringLiteral,
  Super,
  SuperLiteral,
  SuperType,
  Test,
  Throw,
  Try,
  UnaryOp,
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
    'program name { const x = a.m(1) }': Program('name')(VariableDeclaration(Variable('x'), false, FeatureCall(Variable('a'), 'm')(NumberLiteral(1)))),
    'program { }': FAIL,
    'program name { ': FAIL,
    'program name': FAIL
  },

  test: {
    'test "name" { }': Test(StringLiteral('name'))(),
    'test "name" { const x = a.m(1) }': Test(StringLiteral('name'))(VariableDeclaration(Variable('x'), false, FeatureCall(Variable('a'), 'm')(NumberLiteral(1)))),
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
    'package p.q { class C {} }': Package('p.q')(ClassDeclaration('C')()()),
    'package p.q { class C {} object O {} }': Package('p.q')(ClassDeclaration('C')()(), ObjectDeclaration('O')()()),
    'package p. {}': FAIL,
    'package p': FAIL
  },

  class: {
    'class C { }': ClassDeclaration('C')()(),
    'class C { var v; method m() }': ClassDeclaration('C')()(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')())(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S(a,b) { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')(Variable('a'), Variable('b')))(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S mixed with p.M { }': ClassDeclaration('C')(SuperType('p.S')(), 'p.M')(),
    'class C inherits p.S mixed with p.M { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')(), 'p.M')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S mixed with p.M and p.N { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')(), 'p.M', 'p.N')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C mixed with p.M and p.N { var v; method m() }': ClassDeclaration('C')(undefined, 'p.M', 'p.N')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class { var v; method m() }': FAIL,
    'class C': FAIL,
    'class C inherits p.S mixed with p.M': FAIL,
    'class C inherits p.S mixed with {}': FAIL,
    'class C inherits p.S mixed {}': FAIL,
    'class C inherits {}': FAIL,
    class: FAIL
  },

  mixin: {
    'mixin M { }': MixinDeclaration('M')(),
    'mixin M { var v; method m() }': MixinDeclaration('M')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'mixin { var v; method m() }': FAIL,
    'mixin { constructor() }': FAIL,
    'mixin M': FAIL,
    mixin: FAIL
  },

  namedObject: {
    'object O { }': ObjectDeclaration('O')()(),
    'object O { var v; method m() }': ObjectDeclaration('O')()(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')())(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S(a,b) { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')(Variable('a'), Variable('b')))(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S mixed with p.M { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')(), 'p.M')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S mixed with p.M and p.N { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')(), 'p.M', 'p.N')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O mixed with p.M and p.N { var v; method m() }': ObjectDeclaration('O')(undefined, 'p.M', 'p.N')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
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

  variableDeclaration: {
    'var _foo123': VariableDeclaration(Variable('_foo123'), true),
    'const _foo123 = b': VariableDeclaration(Variable('_foo123'), false, Variable('b')),
    var: FAIL,
    const: FAIL,
    'var 5': FAIL,
    'const 5': FAIL
  },

  methodDeclaration: {
    'method m()': MethodDeclaration('m')()(),
    'method m(p)': MethodDeclaration('m')(Parameter('p'))(),
    'method m(p,q)': MethodDeclaration('m')(Parameter('p'), Parameter('q'))(),
    'method m(p...)': MethodDeclaration('m')(Parameter('p', true))(),
    'method m(p,q...)': MethodDeclaration('m')(Parameter('p'), Parameter('q', true))(),
    'method m(p) { }': MethodDeclaration('m')(Parameter('p'))(),
    'method m(p) { p++ }': MethodDeclaration('m')(Parameter('p'))(UnaryOp('++', Variable('p'))),
    'method m(p) = p++': MethodDeclaration('m')(Parameter('p'))(UnaryOp('++', Variable('p'))),
    'override method m(p)': MethodDeclaration('m', true)(Parameter('p'))(),
    'override method m(p) native': MethodDeclaration('m', true, true)(Parameter('p'))(),
    'method m() = { a }': MethodDeclaration('m')()(Closure()(Variable('a'))),
    'method m(p...,q...)': FAIL,
    'method m(p...,q)': FAIL,
    'method m(p,q) =': FAIL,
    'method m(p,q) native = q': FAIL,
    'method m(p,q) native { }': FAIL
  },

  constructorDeclaration: {
    'constructor()': ConstructorDeclaration()()(),
    'constructor () { }': ConstructorDeclaration()()(),
    'constructor(p)': ConstructorDeclaration(Parameter('p'))()(),
    'constructor(p, q)': ConstructorDeclaration(Parameter('p'), Parameter('q'))()(),
    'constructor(p...)': ConstructorDeclaration(Parameter('p', true))()(),
    'constructor(p, q...)': ConstructorDeclaration(Parameter('p'), Parameter('q', true))()(),
    'constructor(p) { p++ }': ConstructorDeclaration(Parameter('p'))()(UnaryOp('++', Variable('p'))),
    'constructor(p) = self()': ConstructorDeclaration(Parameter('p'))(SelfLiteral, [])(),
    'constructor(p) = self(p,p + 1)': ConstructorDeclaration(Parameter('p'))(SelfLiteral, [Variable('p'), BinaryOp('+', Variable('p'), NumberLiteral(1))])(),
    'constructor(p) = self(p,p + 1) { p++ }': ConstructorDeclaration(Parameter('p'))(SelfLiteral, [Variable('p'), BinaryOp('+', Variable('p'), NumberLiteral(1))])(UnaryOp('++', Variable('p'))),
    'constructor(p) = super()': ConstructorDeclaration(Parameter('p'))(SuperLiteral, [])(),
    'constructor(p) = super(p,p + 1)': ConstructorDeclaration(Parameter('p'))(SuperLiteral, [Variable('p'), BinaryOp('+', Variable('p'), NumberLiteral(1))])(),
    'constructor(p) = super(p,p + 1) { p++ }': ConstructorDeclaration(Parameter('p'))(SuperLiteral, [Variable('p'), BinaryOp('+', Variable('p'), NumberLiteral(1))])(UnaryOp('++', Variable('p'))),
    constructor: FAIL,
    'constructor(': FAIL,
    'constructor() = { }': FAIL,
    'constructor() = self': FAIL,
    'constructor() = super': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // SENTENCES
  //-------------------------------------------------------------------------------------------------------------------------------

  sentence: {
    'var _foo123': VariableDeclaration(Variable('_foo123'), true),
    'var _foo123;': VariableDeclaration(Variable('_foo123'), true),
    '   var _foo123  ; ': VariableDeclaration(Variable('_foo123'), true),
    '=>': FAIL,
    'class C {}': FAIL,
    'mixin M {}': FAIL,
    'object O {}': FAIL
  },

  return: {
    'return e': Return(Variable('e')),
    return: FAIL
  },

  assignment: {
    'a = b': Assignment(Variable('a'), Variable('b')),
    'a += b': Assignment(Variable('a'), BinaryOp('+', Variable('a'), Variable('b'))),
    'a -= b': Assignment(Variable('a'), BinaryOp('-', Variable('a'), Variable('b'))),
    'a *= b': Assignment(Variable('a'), BinaryOp('*', Variable('a'), Variable('b'))),
    'a /= b': Assignment(Variable('a'), BinaryOp('/', Variable('a'), Variable('b'))),
    'a %= b': Assignment(Variable('a'), BinaryOp('%', Variable('a'), Variable('b'))),
    'a <<= b': Assignment(Variable('a'), BinaryOp('<<', Variable('a'), Variable('b'))),
    'a >>= b': Assignment(Variable('a'), BinaryOp('>>', Variable('a'), Variable('b'))),
    'a >>>= b': Assignment(Variable('a'), BinaryOp('>>>', Variable('a'), Variable('b'))),
    'a = b = c': FAIL,
    'a = b += c': FAIL,
    'a += b = c': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS: COMBINATED
  //-------------------------------------------------------------------------------------------------------------------------------

  orExpression: {
    'a || b': BinaryOp('||', Variable('a'), Variable('b')),
    'a or b': BinaryOp('or', Variable('a'), Variable('b')),
    'a and b || !(c > d)': BinaryOp('||', BinaryOp('and', Variable('a'), Variable('b')), UnaryOp('!', BinaryOp('>', Variable('c'), Variable('d'))))
  },

  andExpression: {
    'a && b': BinaryOp('&&', Variable('a'), Variable('b')),
    'a and b': BinaryOp('and', Variable('a'), Variable('b')),
    'a == b && !(c and d)': BinaryOp('&&', BinaryOp('==', Variable('a'), Variable('b')), UnaryOp('!', BinaryOp('and', Variable('c'), Variable('d'))))
  },

  equalityExpression: {
    'a == b': BinaryOp('==', Variable('a'), Variable('b')),
    'a != b': BinaryOp('!=', Variable('a'), Variable('b')),
    'a === b': BinaryOp('===', Variable('a'), Variable('b')),
    'a !== b': BinaryOp('!==', Variable('a'), Variable('b')),
    'a + x == -b * y': BinaryOp('==', BinaryOp('+', Variable('a'), Variable('x')), BinaryOp('*', UnaryOp('-', Variable('b')), Variable('y')))
  },

  orderExpression: {
    'a >= b': BinaryOp('>=', Variable('a'), Variable('b')),
    'a <= b': BinaryOp('<=', Variable('a'), Variable('b')),
    'a > b': BinaryOp('>', Variable('a'), Variable('b')),
    'a < b': BinaryOp('<', Variable('a'), Variable('b')),
    'a + x < -b * y': BinaryOp('<', BinaryOp('+', Variable('a'), Variable('x')), BinaryOp('*', UnaryOp('-', Variable('b')), Variable('y'))),
    'a instanceof p.C': InstanceOf(Variable('a'), 'p.C'),
    'a.m() instanceof p.C': InstanceOf(FeatureCall(Variable('a'), 'm')(), 'p.C'),
    'a instanceof': FAIL,
    'instanceof t': FAIL
  },

  otherOpExpression: {
    'a ..< b': BinaryOp('..<', Variable('a'), Variable('b')),
    'a >.. b': BinaryOp('>..', Variable('a'), Variable('b')),
    'a .. b': BinaryOp('..', Variable('a'), Variable('b')),
    'a -> b': BinaryOp('->', Variable('a'), Variable('b')),
    'a >>> b': BinaryOp('>>>', Variable('a'), Variable('b')),
    'a >> b': BinaryOp('>>', Variable('a'), Variable('b')),
    'a <<< b': BinaryOp('<<<', Variable('a'), Variable('b')),
    'a << b': BinaryOp('<<', Variable('a'), Variable('b')),
    'a <=> b': BinaryOp('<=>', Variable('a'), Variable('b')),
    'a <> b': BinaryOp('<>', Variable('a'), Variable('b')),
    'a ?: b': BinaryOp('?:', Variable('a'), Variable('b')),
    'a * -x <=> (b - y >> c)++': BinaryOp('<=>', BinaryOp('*', Variable('a'), UnaryOp('-', Variable('x'))), UnaryOp('++', BinaryOp('>>', BinaryOp('-', Variable('b'), Variable('y')), Variable('c'))))
  },

  additiveExpression: {
    'a + b': BinaryOp('+', Variable('a'), Variable('b')),
    'a - b': BinaryOp('-', Variable('a'), Variable('b')),
    'a +b -c': BinaryOp('-', BinaryOp('+', Variable('a'), Variable('b')), Variable('c')),
    'a + (b - c)': BinaryOp('+', Variable('a'), BinaryOp('-', Variable('b'), Variable('c'))),
    'a * -x + (b - c)++': BinaryOp('+', BinaryOp('*', Variable('a'), UnaryOp('-', Variable('x'))), UnaryOp('++', BinaryOp('-', Variable('b'), Variable('c'))))
  },

  multiplicativeExpression: {
    'a * b': BinaryOp('*', Variable('a'), Variable('b')),
    'a ** b': BinaryOp('**', Variable('a'), Variable('b')),
    'a / b': BinaryOp('/', Variable('a'), Variable('b')),
    'a % b': BinaryOp('%', Variable('a'), Variable('b')),
    'a * b / c': BinaryOp('/', BinaryOp('*', Variable('a'), Variable('b')), Variable('c')),
    'a * (b / c)': BinaryOp('*', Variable('a'), BinaryOp('/', Variable('b'), Variable('c'))),
    'a++ * -(b / c)': BinaryOp('*', UnaryOp('++', Variable('a')), UnaryOp('-', BinaryOp('/', Variable('b'), Variable('c')))),
    'a * (b + c)': BinaryOp('*', Variable('a'), BinaryOp('+', Variable('b'), Variable('c')))
  },

  prefixUnaryExpression: {
    'not a': UnaryOp('not', Variable('a')),
    '!a': UnaryOp('!', Variable('a')),
    '-a': UnaryOp('-', Variable('a')),
    '+a': UnaryOp('+', Variable('a')),
    'not !a': UnaryOp('not', UnaryOp('!', Variable('a'))),
    '-a++': UnaryOp('-', UnaryOp('++', Variable('a'))),
    '(-a)++': UnaryOp('++', UnaryOp('-', Variable('a')))
  },

  postfixUnaryExpression: {
    'a++': UnaryOp('++', Variable('a')),
    'a--': UnaryOp('--', Variable('a')),
    '((a--)++)--': UnaryOp('--', UnaryOp('++', UnaryOp('--', Variable('a'))))
  },

  featureCall: {
    'a.m()': FeatureCall(Variable('a'), 'm')(),
    'a.m(p)': FeatureCall(Variable('a'), 'm')(Variable('p')),
    'a.m{p => p}': FeatureCall(Variable('a'), 'm')(Closure(Parameter('p'))(Variable('p'))),
    'a.m(p, q)': FeatureCall(Variable('a'), 'm')(Variable('p'), Variable('q')),
    'a?.m(p, q)': FeatureCall(Variable('a'), 'm', true)(Variable('p'), Variable('q')),
    'a.m(p, q).n().o(r)': FeatureCall(FeatureCall(FeatureCall(Variable('a'), 'm')(Variable('p'), Variable('q')), 'n')(), 'o')(Variable('r')),
    '(a + 5).m(p, q)': FeatureCall(BinaryOp('+', Variable('a'), NumberLiteral(5)), 'm')(Variable('p'), Variable('q')),
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
    'new p.C(a, b++)': New('p.C')(Variable('a'), UnaryOp('++', Variable('b'))),
    'new p.C': FAIL,
    new: FAIL
  },

  superInvocation: {
    'super()': Super(),
    'super(a)': Super(Variable('a')),
    'super(a, b++)': Super(Variable('a'), UnaryOp('++', Variable('b'))),
    super: FAIL,
    'super.m()': FAIL
  },

  ifExpression: {
    'if(a > b) x': If(BinaryOp('>', Variable('a'), Variable('b')))(Variable('x'))(),
    'if (a > b)x': If(BinaryOp('>', Variable('a'), Variable('b')))(Variable('x'))(),
    'if (a > b){x}': If(BinaryOp('>', Variable('a'), Variable('b')))(Variable('x'))(),
    'if (a > b){x;y}': If(BinaryOp('>', Variable('a'), Variable('b')))(Variable('x'), Variable('y'))(),
    'if (a > b) x else y': If(BinaryOp('>', Variable('a'), Variable('b')))(Variable('x'))(Variable('y')),
    'if (a > b) {x} else {y}': If(BinaryOp('>', Variable('a'), Variable('b')))(Variable('x'))(Variable('y')),
    'if (a > b){x}else{y}': If(BinaryOp('>', Variable('a'), Variable('b')))(Variable('x'))(Variable('y')),
    'if(a) if(b) x else y else z': If(Variable('a'))(If(Variable('b'))(Variable('x'))(Variable('y')))(Variable('z')),
    'if(a) if(b) x else y': If(Variable('a'))(If(Variable('b'))(Variable('x'))(Variable('y')))(),
    'if (a > b)xelse y': FAIL,
    'if a > b x else y': FAIL,
    'if (a > b) x else': FAIL,
    'if (a > b)': FAIL
  },

  tryExpression: {
    'try x++': Try(UnaryOp('++', Variable('x')))()(),
    'try {x++}': Try(UnaryOp('++', Variable('x')))()(),
    'try {x++} catch e h': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e'))(Variable('h')))(),
    'try {x++} catch e: foo.bar.E h': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e'), 'foo.bar.E')(Variable('h')))(),
    'try{ x++ }catch e{h}': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e'))(Variable('h')))(),
    'try{ x++ }catch e : foo.bar.E {h}': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e'), 'foo.bar.E')(Variable('h')))(),
    'try {x++} catch e{h} then always f': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e'))(Variable('h')))(Variable('f')),
    'try {x++} catch e{h} then always {f}': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e'))(Variable('h')))(Variable('f')),
    'try {x++} catch e1{h1} catch e2{h2}': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e1'))(Variable('h1')), Catch(Variable('e2'))(Variable('h2')))(),
    'try {x++} catch e1{h1} catch e2{h2} then always {f}': Try(UnaryOp('++', Variable('x')))(Catch(Variable('e1'))(Variable('h1')), Catch(Variable('e2'))(Variable('h2')))(Variable('f')),
    'try {x++} then always {f}': Try(UnaryOp('++', Variable('x')))()(Variable('f')),
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
    true: BooleanLiteral(true),
    false: BooleanLiteral(false),
    null: NullLiteral,
    1: NumberLiteral(1),
    10: NumberLiteral(10),
    '0x10': NumberLiteral(16),
    '10.50': NumberLiteral(10.50),
    '0x': FAIL,
    '10.': FAIL,
    '.50': FAIL,
    '"foo"': StringLiteral('foo'),
    "'foo'": StringLiteral('foo'),
    '""': StringLiteral(''),
    '"foo\\nbar"': StringLiteral('foo\\nbar'),
    '"foo\nbar"': StringLiteral('foo\nbar'),
    '"foo\\xxx"': FAIL,
    '[]': ListLiteral(),
    '[1]': ListLiteral(NumberLiteral(1)),
    '[1,false,"foo"]': ListLiteral(NumberLiteral(1), BooleanLiteral(false), StringLiteral('foo')),
    '#{1 + b, -5}': SetLiteral(BinaryOp('+', NumberLiteral(1), Variable('b')), UnaryOp('-', NumberLiteral(5))),
    '[': FAIL,
    '[1,2,': FAIL,
    '#{': FAIL,
    '#{1': FAIL,
    'object {}': ObjectDeclaration()()(),
    'object { var v; method m() }': ObjectDeclaration()()(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S { var v; method m() }': ObjectDeclaration()(SuperType('p.S')())(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S(a,b) { var v; method m() }': ObjectDeclaration()(SuperType('p.S')(Variable('a'), Variable('b')))(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S mixed with p.M { var v; method m() }': ObjectDeclaration()(SuperType('p.S')(), 'p.M')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S mixed with p.M and p.N { var v; method m() }': ObjectDeclaration()(SuperType('p.S')(), 'p.M', 'p.N')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object mixed with p.M and p.N { var v; method m() }': ObjectDeclaration()(undefined, 'p.M', 'p.N')(VariableDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object { constructor() }': FAIL,
    'object inherits p.S mixed with p.M': FAIL,
    'object inherits p.S mixed with {}': FAIL,
    'object inherits p.S mixed {}': FAIL,
    'object inherits {}': FAIL,
    'object ': FAIL,
    '{}': Closure()(),
    '{ => }': Closure()(),
    '{ a.m() }': Closure()(FeatureCall(Variable('a'), 'm')()),
    '{ a => }': Closure(Parameter('a'))(),
    '{ a => a.m() }': Closure(Parameter('a'))(FeatureCall(Variable('a'), 'm')()),
    '{ a, b => a.m() }': Closure(Parameter('a'), Parameter('b'))(FeatureCall(Variable('a'), 'm')()),
    '{ a, b... => a.m() }': Closure(Parameter('a'), Parameter('b', true))(FeatureCall(Variable('a'), 'm')()),
    '{ a, b => a.m(); b }': Closure(Parameter('a'), Parameter('b'))(FeatureCall(Variable('a'), 'm')(), Variable('b')),
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