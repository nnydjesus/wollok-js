
export const linkParentStep = (node, parent) => { if (parent) node.parent = parent }
export const unlinkParent = node => { delete node.parent }