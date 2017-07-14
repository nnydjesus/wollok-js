import { ExtendableError } from '../../utils/error'

export class LinkerError extends ExtendableError { }

export const checkAndFailStep = ({ node, unresolvables }) => {
  // TODO: backward compat error handling. This should be modelled better
  if (unresolvables.length > 0) {
    throw new LinkerError(`Cannot resolve reference to '${unresolvables[0]}' at ???`)
  }
  return node
}