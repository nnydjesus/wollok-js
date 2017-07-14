import { pipe } from '../utils/functions'
import { linkParentStep } from './steps/linkParent'
import { createScopesStep } from './steps/createScopes'
import { linkStep } from './steps/link'
import { checkAndFailStep } from './steps/check'

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

  // try to do both things in one pass
  linkParentStep,
  createScopesStep,

  linkStep,

  checkAndFailStep

])