import { onEnter } from '../../visitors/commons'

export const linkParentStep = onEnter((node, parent) => {
  if (parent) node.parent = parent
})

export const unlinkParent = onEnter(node => { delete node.parent })