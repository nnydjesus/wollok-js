import path from 'path'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { readFileSync } from 'fs'
import parser from '../src/parser'
import interpret from '../src/interpreter'
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

const fixture = new Map([

//-------------------------------------------------------------------------------------------------------------------------------
// SENTENCES
//-------------------------------------------------------------------------------------------------------------------------------
// Not very useful tests, but at least serves to check it does not crash...

  [ VariableDeclaration(Variable('a'), true)                    , undefined                              ],
  [ VariableDeclaration(Variable('a'), true, NumberLiteral(1))  , undefined                              ],
  [ VariableDeclaration(Variable('a'), false, NumberLiteral(1)) , undefined                              ],


  [ FeatureCall(Closure()(VariableDeclaration(Variable('a'), true),Variable('a')),'call')()                    , null ],
  [ FeatureCall(Closure()(VariableDeclaration(Variable('a'), true, NumberLiteral(1)),Variable('a')),'call')()  , 1    ],
  [ FeatureCall(Closure()(VariableDeclaration(Variable('a'), false, NumberLiteral(1)),Variable('a')),'call')() , 1    ],

  [ FeatureCall(Closure()(
      VariableDeclaration(Variable('a'), true, NumberLiteral(1)),
      Assignment(Variable('a'), NumberLiteral(2)),
      Variable('a')
    ),'call')()                                                   , 2                                      ],
  [ Assignment(Variable('a'), NumberLiteral(1))                   , new ReferenceError('a is not defined') ],


//-------------------------------------------------------------------------------------------------------------------------------
// EXPRESSIONS
//-------------------------------------------------------------------------------------------------------------------------------

  [ Variable('a'), new ReferenceError('a is not defined') ],

  [ BinaryOp('||', BooleanLiteral(true), BooleanLiteral(false))  , true  ],
  [ BinaryOp('or', BooleanLiteral(true), BooleanLiteral(false))  , true  ],
  [ BinaryOp('&&', BooleanLiteral(true), BooleanLiteral(false))  , false ],
  [ BinaryOp('and', BooleanLiteral(true), BooleanLiteral(false)) , false ],
  [ BinaryOp('===', NumberLiteral(5), NumberLiteral(3))          , false ],
  [ BinaryOp('!==', NumberLiteral(5), NumberLiteral(3))          , true  ],
  [ BinaryOp('==', NumberLiteral(5), NumberLiteral(3))           , false ],
  [ BinaryOp('!=', NumberLiteral(5), NumberLiteral(3))           , true  ],
  [ BinaryOp('>=', NumberLiteral(5), NumberLiteral(3))           , true  ],
  [ BinaryOp('<=', NumberLiteral(5), NumberLiteral(3))           , false ],
  [ BinaryOp('>', NumberLiteral(5), NumberLiteral(3))            , true  ],
  [ BinaryOp('<', NumberLiteral(5), NumberLiteral(3))            , false ],
  [ BinaryOp('+', NumberLiteral(5), NumberLiteral(3))            , 8     ],
  [ BinaryOp('-', NumberLiteral(5), NumberLiteral(3))            , 2     ],
  [ BinaryOp('**', NumberLiteral(5), NumberLiteral(3))           , 125   ],
  [ BinaryOp('*', NumberLiteral(5), NumberLiteral(3))            , 15    ],
  [ BinaryOp('/', NumberLiteral(5), NumberLiteral(3))            , 5 / 3 ],
  [ BinaryOp('%', NumberLiteral(5), NumberLiteral(3))            , 2     ],
  // //TODO: Other Ops: '..<' / '>..' / '..' / '->' / '>>>' / '>>' / '<<<' / '<<' / '<=>' / '<>' / '?:'

  [ UnaryOp('-', NumberLiteral(5))       , -5                                     ],
  [ UnaryOp('++', Variable('a'))         , new ReferenceError('a is not defined') ],
  [ UnaryOp('--', Variable('a'))         , new ReferenceError('a is not defined') ],
  [ UnaryOp('!', BooleanLiteral(true))   , false                                  ],
  [ UnaryOp('not', BooleanLiteral(true)) , false                                  ],
  //TODO: prefix +: WTF does it do???
  
  // TODO: InstanceOf
  // TODO: New
  // TODO: Super

  [ If(BooleanLiteral(true))(NumberLiteral(1))(NumberLiteral(2))  , 1 ],
  [ If(BooleanLiteral(false))(NumberLiteral(1))(NumberLiteral(2)) , 2 ],

  [ Try(NumberLiteral(1))(Catch(Variable('e'))(NumberLiteral(2)))()              , 1 ],
  [ Try(NumberLiteral(1))()(NumberLiteral(3))                                    , 3 ],
  [ Try(Throw(StringLiteral("woops")))(Catch(Variable('e'))(NumberLiteral(2)))() , 2 ],

  [ FeatureCall(Closure()(
      Return(NumberLiteral(2)),
      NumberLiteral(1)
    ),'call')()                                                   , 2 ],
  [ FeatureCall(Closure()(
      NumberLiteral(1),
      Return(NumberLiteral(2))
    ),'call')()                                                   , 2 ],


//-------------------------------------------------------------------------------------------------------------------------------
// LITERALS
//-------------------------------------------------------------------------------------------------------------------------------

  [ NullLiteral                                            , null            ],
  [ SelfLiteral                                            , this            ],
  [ BooleanLiteral(true)                                   , true            ],
  [ NumberLiteral(1)                                       , 1               ],
  [ NumberLiteral(7.5)                                     , 7.5             ],
  [ StringLiteral('foo')                                   , "foo"           ],
  [ SetLiteral(NumberLiteral(1), NumberLiteral(2))         , new Set([1, 2]) ],
  [ ListLiteral(NumberLiteral(1), NumberLiteral(2))        , [1, 2]          ],
  [ Closure(Parameter('a'), Parameter('b'))(Variable('a')) , (a,b) => a      ],

])

describe('Wollok interpreter', () => {

  for (const [ast, expected] of fixture.entries()) {
    const result = () => interpret(ast)

    it(`should interpret ${JSON.stringify(ast)}`, () => {
      if(expected instanceof Error) expect(result).to.throw(expected.constructor, expected.message)
      else if(typeof expected === 'function') expect( result().toString().replace(/[\n ]/g,'') ).to.equal( expected.toString().replace(/[\n ]/g,'') )
      else expect(result()).to.deep.equal(expected)
    })
  }

})