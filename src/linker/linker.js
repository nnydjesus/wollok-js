import { pipe } from '../utils/functions'
import { linkParentStep, createScopesStep, linkStep, checkAndFailStep } from './steps'

// winston.level = 'silly'

export default class Linker {
  link(node) {
    return pipe([

      // try to do both things in one pass
      linkParentStep,
      createScopesStep,

      linkStep,

      checkAndFailStep

    ])(node)
  }
}
