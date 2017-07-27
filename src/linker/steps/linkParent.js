
export const linkParentStep = (node, parent) => ({
  ...node,
  ...parent && { parent }
})
export const unlinkParent = ({ parent, ...rest }) => ({
  ...rest
})