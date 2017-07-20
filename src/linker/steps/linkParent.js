
export const linkParentStep = ({
  enter(node, parent) {
    if (parent) node.parent = parent
  }
})

export const unlinkParent = ({
  enter(node) { delete node.parent }
})