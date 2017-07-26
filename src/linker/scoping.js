
export const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))

export const scopeFor = node => {
  if (!node) return {}
  return {
    ...node.scope,
    ...scopeFor(node.parent)
  }
}