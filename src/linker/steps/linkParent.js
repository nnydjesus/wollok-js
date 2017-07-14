import { visit } from '../../visitors/visiting'

export const linkParentStep = node => visit(node, {
  enter(node, parent) {
    if (parent) node.parent = parent
  }
})