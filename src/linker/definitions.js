import { Block, Program, File, ClassDeclaration, MethodDeclaration, Closure, ObjectDeclaration, MixinDeclaration } from '../model'

/* nodes that define new scopes/namespaces */
const scopeables = [
  File.name,
  Program.name,
  ClassDeclaration.name,
  ObjectDeclaration.name,
  MethodDeclaration.name,
  MixinDeclaration.name,
  Closure.name,
  Block.name
]
export const isScopeable = type => scopeables.includes(type)

const byName = n => n.name
/* nodes which gets registered in their parent's scope */
export const referenciables = {
  VariableDeclaration: _ => byName(_.variable),
  FieldDeclaration: _ => byName(_.variable),
  Param: byName,
  ClassDeclaration: byName,
  MixinDeclaration: byName,
  ObjectDeclaration: byName
}

export const linkeables = {
  Variable: v => v.name,
  New: n => n.target,
  SuperType: s => s.name
}