import { pipe } from '../utils/functions'
import { flatten } from '../utils/collections'
import { visit } from '../visitors/visiting'
import { collect, chain } from '../visitors/commons'
import { linkParentStep } from './steps/linkParent'
import { createScopesStep } from './steps/createScopes'
import { linkStep, isLinkageError } from './steps/link'

// winston.level = 'silly'

/** 
 * Performs linking on the given ast nodes.
 * Each linked node will have a "link"  `Node(type=Variable)` will have a  property pointing to 
 * the VariableDeclaration|Param.
 * Also some context-defining nodes like ClassDeclarartion | Closure | Method ...etc
 * will have a "scope" property with an object with name-variableDeclaration representing the 
 * locally available variables.
 */
export const link = pipe([

  // sets node.parent & node.scope =  { varA: Node(VariableDec), varB: Node(VariableDec) }
  visit(chain(linkParentStep, createScopesStep())),

  linkStep // sets Node(Variable).link = VariableDec | Class | Mixin

])

// retrieves a list of all errors in all nodes
// errors for the sake of tests are like this { ...error, node }
// so you can assert about the owner node
export const collectErrors = (node) => flatten(
  collect(node, n => (n.errors || [])
    .map(e => ({
      ...e,
      node: n,
    }))
  )).filter(isLinkageError)

