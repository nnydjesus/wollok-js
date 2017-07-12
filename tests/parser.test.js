import { describe, it } from 'mocha'
import { expect } from 'chai'
import parser from '../src/parser'
import {
  Assignment,
  Catch,
  ClassDeclaration,
  Closure,
  ConstructorDeclaration,
  FeatureCall,
  FieldDeclaration,
  If,
  Import,
  InstanceOf,
  ListLiteral,
  MethodDeclaration,
  MixinDeclaration,
  ObjectDeclaration,
  New,
  Package,
  Parameter,
  Program,
  Return,
  SelfLiteral,
  SetLiteral,
  Literal,
  Super,
  SuperLiteral,
  SuperType,
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
    'program name { const x = a.m(1) }': Program('name')(VariableDeclaration(Variable('x'), false, FeatureCall(Variable('a'), 'm')(Literal(1)))),
    'program { }': FAIL,
    'program name { ': FAIL,
    'program name': FAIL
  },

  test: {
    'test "name" { }': Test(Literal('name'))(),
    'test "name" { const x = a.m(1) }': Test(Literal('name'))(VariableDeclaration(Variable('x'), false, FeatureCall(Variable('a'), 'm')(Literal(1)))),
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
    'class C { var v; method m() }': ClassDeclaration('C')()(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')())(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S(a,b) { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')(Variable('a'), Variable('b')))(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S mixed with p.M { }': ClassDeclaration('C')(SuperType('p.S')(), 'p.M')(),
    'class C inherits p.S mixed with p.M { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')(), 'p.M')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C inherits p.S mixed with p.M and p.N { var v; method m() }': ClassDeclaration('C')(SuperType('p.S')(), 'p.M', 'p.N')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'class C mixed with p.M and p.N { var v; method m() }': ClassDeclaration('C')(undefined, 'p.M', 'p.N')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
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
    'mixin M { var v; method m() }': MixinDeclaration('M')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'mixin { var v; method m() }': FAIL,
    'mixin { constructor() }': FAIL,
    'mixin M': FAIL,
    mixin: FAIL
  },

  namedObject: {
    'object O { }': ObjectDeclaration('O')()(),
    'object O { var v; method m() }': ObjectDeclaration('O')()(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')())(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S(a,b) { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')(Variable('a'), Variable('b')))(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S mixed with p.M { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')(), 'p.M')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O inherits p.S mixed with p.M and p.N { var v; method m() }': ObjectDeclaration('O')(SuperType('p.S')(), 'p.M', 'p.N')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object O mixed with p.M and p.N { var v; method m() }': ObjectDeclaration('O')(undefined, 'p.M', 'p.N')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
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

  fieldDeclaration: {
    'var _foo123': FieldDeclaration(Variable('_foo123'), true),
    'const _foo123 = b': FieldDeclaration(Variable('_foo123'), false, Variable('b')),
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
    'method m(p) { p++ }': MethodDeclaration('m')(Parameter('p'))(FeatureCall(Variable('p'), '_++')()),
    'method m(p) = p++': MethodDeclaration('m')(Parameter('p'))(FeatureCall(Variable('p'), '_++')()),
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
    'constructor(p) { p++ }': ConstructorDeclaration(Parameter('p'))()(FeatureCall(Variable('p'), '_++')()),
    'constructor(p) = self()': ConstructorDeclaration(Parameter('p'))(SelfLiteral, [])(),
    'constructor(p) = self(p,p + 1)': ConstructorDeclaration(Parameter('p'))(SelfLiteral, [Variable('p'), FeatureCall(Variable('p'), '+')(Literal(1))])(),
    'constructor(p) = self(p,p + 1) { p++ }': ConstructorDeclaration(Parameter('p'))(SelfLiteral, [Variable('p'), FeatureCall(Variable('p'), '+')(Literal(1))])(FeatureCall(Variable('p'), '_++')()),
    'constructor(p) = super()': ConstructorDeclaration(Parameter('p'))(SuperLiteral, [])(),
    'constructor(p) = super(p,p + 1)': ConstructorDeclaration(Parameter('p'))(SuperLiteral, [Variable('p'), FeatureCall(Variable('p'), '+')(Literal(1))])(),
    'constructor(p) = super(p,p + 1) { p++ }': ConstructorDeclaration(Parameter('p'))(SuperLiteral, [Variable('p'), FeatureCall(Variable('p'), '+')(Literal(1))])(FeatureCall(Variable('p'), '_++')()),
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
    'a += b': Assignment(Variable('a'), FeatureCall(Variable('a'), '+')(Variable('b'))),
    'a -= b': Assignment(Variable('a'), FeatureCall(Variable('a'), '-')(Variable('b'))),
    'a *= b': Assignment(Variable('a'), FeatureCall(Variable('a'), '*')(Variable('b'))),
    'a /= b': Assignment(Variable('a'), FeatureCall(Variable('a'), '/')(Variable('b'))),
    'a %= b': Assignment(Variable('a'), FeatureCall(Variable('a'), '%')(Variable('b'))),
    'a <<= b': Assignment(Variable('a'), FeatureCall(Variable('a'), '<<')(Variable('b'))),
    'a >>= b': Assignment(Variable('a'), FeatureCall(Variable('a'), '>>')(Variable('b'))),
    'a >>>= b': Assignment(Variable('a'), FeatureCall(Variable('a'), '>>>')(Variable('b'))),
    'a = b = c': FAIL,
    'a = b += c': FAIL,
    'a += b = c': FAIL
  },

  //-------------------------------------------------------------------------------------------------------------------------------
  // EXPRESSIONS: COMBINATED
  //-------------------------------------------------------------------------------------------------------------------------------

  orExpression: {
    'a || b': FeatureCall(Variable('a'), '||')(Variable('b')),
    'a or b': FeatureCall(Variable('a'), 'or')(Variable('b')),
    'a and b || !(c > d)': FeatureCall(FeatureCall(Variable('a'), 'and')(Variable('b')), '||')(FeatureCall(FeatureCall(Variable('c'), '>')(Variable('d')), '!_')())
  },

  andExpression: {
    'a && b': FeatureCall(Variable('a'), '&&')(Variable('b')),
    'a and b': FeatureCall(Variable('a'), 'and')(Variable('b')),
    'a == b && !(c and d)': FeatureCall(FeatureCall(Variable('a'), '==')(Variable('b')), '&&')(FeatureCall(FeatureCall(Variable('c'), 'and')(Variable('d')), '!_')())
  },

  equalityExpression: {
    'a == b': FeatureCall(Variable('a'), '==')(Variable('b')),
    'a != b': FeatureCall(Variable('a'), '!=')(Variable('b')),
    'a === b': FeatureCall(Variable('a'), '===')(Variable('b')),
    'a !== b': FeatureCall(Variable('a'), '!==')(Variable('b')),
    'a + x == -b * y': FeatureCall(FeatureCall(Variable('a'), '+')(Variable('x')), '==')(FeatureCall(FeatureCall(Variable('b'), '-_')(), '*')(Variable('y')))
  },

  orderExpression: {
    'a >= b': FeatureCall(Variable('a'), '>=')(Variable('b')),
    'a <= b': FeatureCall(Variable('a'), '<=')(Variable('b')),
    'a > b': FeatureCall(Variable('a'), '>')(Variable('b')),
    'a < b': FeatureCall(Variable('a'), '<')(Variable('b')),
    'a + x < -b * y': FeatureCall(FeatureCall(Variable('a'), '+')(Variable('x')), '<')(FeatureCall(FeatureCall(Variable('b'), '-_')(), '*')(Variable('y'))),
    'a instanceof p.C': InstanceOf(Variable('a'), 'p.C'),
    'a.m() instanceof p.C': InstanceOf(FeatureCall(Variable('a'), 'm')(), 'p.C'),
    'a instanceof': FAIL,
    'instanceof t': FAIL
  },

  otherOpExpression: {
    'a ..< b': FeatureCall(Variable('a'), '..<')(Variable('b')),
    'a >.. b': FeatureCall(Variable('a'), '>..')(Variable('b')),
    'a .. b': FeatureCall(Variable('a'), '..')(Variable('b')),
    'a -> b': FeatureCall(Variable('a'), '->')(Variable('b')),
    'a >>> b': FeatureCall(Variable('a'), '>>>')(Variable('b')),
    'a >> b': FeatureCall(Variable('a'), '>>')(Variable('b')),
    'a <<< b': FeatureCall(Variable('a'), '<<<')(Variable('b')),
    'a << b': FeatureCall(Variable('a'), '<<')(Variable('b')),
    'a <=> b': FeatureCall(Variable('a'), '<=>')(Variable('b')),
    'a <> b': FeatureCall(Variable('a'), '<>')(Variable('b')),
    'a ?: b': FeatureCall(Variable('a'), '?:')(Variable('b')),
    'a * -x <=> (b - y >> c)++': FeatureCall(FeatureCall(Variable('a'), '*')(FeatureCall(Variable('x'), '-_')()), '<=>')(FeatureCall(FeatureCall(FeatureCall(Variable('b'), '-')(Variable('y')), '>>')(Variable('c')), '_++')())
  },

  additiveExpression: {
    'a + b': FeatureCall(Variable('a'), '+')(Variable('b')),
    'a - b': FeatureCall(Variable('a'), '-')(Variable('b')),
    'a +b -c': FeatureCall(FeatureCall(Variable('a'), '+')(Variable('b')), '-')(Variable('c')),
    'a + (b - c)': FeatureCall(Variable('a'), '+')(FeatureCall(Variable('b'), '-')(Variable('c'))),
    'a * -x + (b - c)++': FeatureCall(FeatureCall(Variable('a'), '*')(FeatureCall(Variable('x'), '-_')()), '+')(FeatureCall(FeatureCall(Variable('b'), '-')(Variable('c')), '_++')())
  },

  multiplicativeExpression: {
    'a * b': FeatureCall(Variable('a'), '*')(Variable('b')),
    'a ** b': FeatureCall(Variable('a'), '**')(Variable('b')),
    'a / b': FeatureCall(Variable('a'), '/')(Variable('b')),
    'a % b': FeatureCall(Variable('a'), '%')(Variable('b')),
    'a * b / c': FeatureCall(FeatureCall(Variable('a'), '*')(Variable('b')), '/')(Variable('c')),
    'a * (b / c)': FeatureCall(Variable('a'), '*')(FeatureCall(Variable('b'), '/')(Variable('c'))),
    'a++ * -(b / c)': FeatureCall(FeatureCall(Variable('a'), '_++')(), '*')(FeatureCall(FeatureCall(Variable('b'), '/')(Variable('c')), '-_')()),
    'a * (b + c)': FeatureCall(Variable('a'), '*')(FeatureCall(Variable('b'), '+')(Variable('c')))
  },

  prefixUnaryExpression: {
    'not a': FeatureCall(Variable('a'), 'not_')(),
    '!a': FeatureCall(Variable('a'), '!_')(),
    '-a': FeatureCall(Variable('a'), '-_')(),
    '+a': FeatureCall(Variable('a'), '+_')(),
    'not !a': FeatureCall(FeatureCall(Variable('a'), '!_')(), 'not_')(),
    '-a++': FeatureCall(FeatureCall(Variable('a'), '_++')(), '-_')(),
    '(-a)++': FeatureCall(FeatureCall(Variable('a'), '-_')(), '_++')(),
  },

  postfixUnaryExpression: {
    'a++': FeatureCall(Variable('a'), '_++')(),
    'a--': FeatureCall(Variable('a'), '_--')(),
    '((a--)++)--': FeatureCall(FeatureCall(FeatureCall(Variable('a'), '_--')(), '_++')(), '_--')()
  },

  featureCall: {
    'a.m()': FeatureCall(Variable('a'), 'm')(),
    'a.m(p)': FeatureCall(Variable('a'), 'm')(Variable('p')),
    'a.m{p => p}': FeatureCall(Variable('a'), 'm')(Closure(Parameter('p'))(Variable('p'))),
    'a.m(p, q)': FeatureCall(Variable('a'), 'm')(Variable('p'), Variable('q')),
    'a?.m(p, q)': FeatureCall(Variable('a'), 'm', true)(Variable('p'), Variable('q')),
    'a.m(p, q).n().o(r)': FeatureCall(FeatureCall(FeatureCall(Variable('a'), 'm')(Variable('p'), Variable('q')), 'n')(), 'o')(Variable('r')),
    '(a + 5).m(p, q)': FeatureCall(FeatureCall(Variable('a'), '+')(Literal(5)), 'm')(Variable('p'), Variable('q')),
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
    'new p.C(a, b++)': New('p.C')(Variable('a'), FeatureCall(Variable('b'), '_++')()),
    'new p.C': FAIL,
    new: FAIL
  },

  superInvocation: {
    'super()': Super(),
    'super(a)': Super(Variable('a')),
    'super(a, b++)': Super(Variable('a'), FeatureCall(Variable('b'), '_++')()),
    super: FAIL,
    'super.m()': FAIL
  },

  ifExpression: {
    'if(a > b) x': If(FeatureCall(Variable('a'), '>')(Variable('b')))(Variable('x'))(),
    'if (a > b)x': If(FeatureCall(Variable('a'), '>')(Variable('b')))(Variable('x'))(),
    'if (a > b){x}': If(FeatureCall(Variable('a'), '>')(Variable('b')))(Variable('x'))(),
    'if (a > b){x;y}': If(FeatureCall(Variable('a'), '>')(Variable('b')))(Variable('x'), Variable('y'))(),
    'if (a > b) x else y': If(FeatureCall(Variable('a'), '>')(Variable('b')))(Variable('x'))(Variable('y')),
    'if (a > b) {x} else {y}': If(FeatureCall(Variable('a'), '>')(Variable('b')))(Variable('x'))(Variable('y')),
    'if (a > b){x}else{y}': If(FeatureCall(Variable('a'), '>')(Variable('b')))(Variable('x'))(Variable('y')),
    'if(a) if(b) x else y else z': If(Variable('a'))(If(Variable('b'))(Variable('x'))(Variable('y')))(Variable('z')),
    'if(a) if(b) x else y': If(Variable('a'))(If(Variable('b'))(Variable('x'))(Variable('y')))(),
    'if (a > b)xelse y': FAIL,
    'if a > b x else y': FAIL,
    'if (a > b) x else': FAIL,
    'if (a > b)': FAIL
  },

  tryExpression: {
    'try x++': Try(FeatureCall(Variable('x'), '_++')())()(),
    'try {x++}': Try(FeatureCall(Variable('x'), '_++')())()(),
    'try {x++} catch e h': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e'))(Variable('h')))(),
    'try {x++} catch e: foo.bar.E h': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e'), 'foo.bar.E')(Variable('h')))(),
    'try{ x++ }catch e{h}': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e'))(Variable('h')))(),
    'try{ x++ }catch e : foo.bar.E {h}': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e'), 'foo.bar.E')(Variable('h')))(),
    'try {x++} catch e{h} then always f': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e'))(Variable('h')))(Variable('f')),
    'try {x++} catch e{h} then always {f}': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e'))(Variable('h')))(Variable('f')),
    'try {x++} catch e1{h1} catch e2{h2}': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e1'))(Variable('h1')), Catch(Variable('e2'))(Variable('h2')))(),
    'try {x++} catch e1{h1} catch e2{h2} then always {f}': Try(FeatureCall(Variable('x'), '_++')())(Catch(Variable('e1'))(Variable('h1')), Catch(Variable('e2'))(Variable('h2')))(Variable('f')),
    'try {x++} then always {f}': Try(FeatureCall(Variable('x'), '_++')())()(Variable('f')),
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
    '[]': ListLiteral(),
    '[1]': ListLiteral(Literal(1)),
    '[1,false,"foo"]': ListLiteral(Literal(1), Literal(false), Literal('foo')),
    '#{1 + b, -5}': SetLiteral(FeatureCall(Literal(1), '+')(Variable('b')), FeatureCall(Literal(5), '-_')()),
    '[': FAIL,
    '[1,2,': FAIL,
    '#{': FAIL,
    '#{1': FAIL,
    'object {}': ObjectDeclaration()()(),
    'object { var v; method m() }': ObjectDeclaration()()(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S { var v; method m() }': ObjectDeclaration()(SuperType('p.S')())(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S(a,b) { var v; method m() }': ObjectDeclaration()(SuperType('p.S')(Variable('a'), Variable('b')))(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S mixed with p.M { var v; method m() }': ObjectDeclaration()(SuperType('p.S')(), 'p.M')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object inherits p.S mixed with p.M and p.N { var v; method m() }': ObjectDeclaration()(SuperType('p.S')(), 'p.M', 'p.N')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
    'object mixed with p.M and p.N { var v; method m() }': ObjectDeclaration()(undefined, 'p.M', 'p.N')(FieldDeclaration(Variable('v'), true), MethodDeclaration('m')()()),
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