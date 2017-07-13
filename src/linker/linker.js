import { linkParentStep, createScopesStep, linkStep } from './steps'
import { ExtendableError } from '../utils/error'

export class LinkerError extends ExtendableError { }

// winston.level = 'silly'

export default class Linker {
  link(node) {
    this.firstPass(node)
    this.secondPass(node)
    return node
  }
  firstPass(node) {
    // try to do both things in one pass
    linkParentStep(node)
    createScopesStep(node)
  }
  secondPass(node) {
    const unresolvables = linkStep(node)
    // TODO: backward compat error handling. This should be modelled better
    if (unresolvables.length > 0) {
      throw new LinkerError(`Cannot resolve reference to '${unresolvables[0]}' at ???`)
    }
  }
}
