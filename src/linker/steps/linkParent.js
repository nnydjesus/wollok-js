
export const linkParentStep = (node, parent) => {
  const copy = { ...node }
  if (parent)
    copy.parent = parent
  return copy
}
export const unlinkParent = ({ parent, ...rest }) => ({
  ...rest
})