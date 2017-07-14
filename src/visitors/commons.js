import { filter } from '../utils/functions'

// common high-level visitors

export const filtering = (condition, { enter, exit }) => ({
  ...(enter && { enter: filter(condition, enter) }),
  ...(exit && { exit: filter(condition, exit) })
})