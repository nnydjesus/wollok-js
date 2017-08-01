import { pipe } from '../utils/functions'
import { visit } from '../visitors/visiting'
import { chain } from '../visitors/commons'
import { linkParentStep } from './steps/linkParent'
import { createScopesStep } from './steps/createScopes'
import { linkStep } from './steps/link'
import { createPath } from './steps/createPaths'

/** 
 * Performs linking on the given ast nodes.
 * Each linked node will have a "link"  `Node(type=Variable)` will have a  property pointing to 
 * the VariableDeclaration|Param.
 * Also some context-defining nodes like ClassDeclarartion | Closure | Method ...etc
 * will have a "scope" property with an object with name-variableDeclaration representing the 
 * locally available variables.
 */
export const link = pipe([

  // sets 
  //  - node.parent
  //  - node.path = ['root', 'a', 'b[0]', ... ]
  //
  visit(chain(linkParentStep, createPath)),

  //  - node.scope =  { 
  //      varA: ['root', 'sentences[0]'],  // Path to the VariableDeclaration node.
  //      varB: ['root', 'sentences[3]'],
  //    }
  visit(createScopesStep),

  // tries to resolve linkeables attributes with a reference to the node itself
  // sets node.attribute = Ref{ token: originalString, node } or node.errors = [ Error ]
  linkStep

])
