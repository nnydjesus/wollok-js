
// this is like a hack, I guess that it should be the file name (?)
const ROOT_FEATURE = 'root'

export const createPath = (node, parent, feature, index) => ({
  ...node,
  path: (parent ? parent.path : []).concat([assembleFeature(feature, index)])
})

const assembleFeature = (feature, index) => (index >= 0 ? `${feature}[${index}]` : (feature || ROOT_FEATURE))