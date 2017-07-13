import winston from 'winston'

// winston.level = 'silly'

// this should be in the linker !
const ignoredKeys = ['parent', 'link']

export const visit = (node, { onNode, afterNode = () => {} }, parent) => {
  if (!node.type) { return node }
  winston.silly(`visiting ${node.type}`)
  onNode(node, parent)
  Object.keys(node).forEach(key => {
    if (ignoredKeys.includes(key)) return
    const value = node[key]
    const list = Array.isArray(value) ? value : (value && [value] || [])
    list.filter(e => e.type).forEach((e, i) => {
      winston.silly(`\tvisiting ${node.type}.${key}[${i}]`)
      visit(e, { onNode, afterNode }, node)
    })
  })
  afterNode(node)
  return node
}

export const visitor = object => node => visit(node,
  n => methodByConvention(object, n, 'visit'),
  n => methodByConvention(object, n, 'after')
)

function methodByConvention(object, node, preffix) {
  const method = object[`${preffix}${node.type}`]
  if (method) {
    method(node)
  }
}

export const queryNodeByType = (root, type, filter = () => true) => {
  const possibles = []
  const matches = []

  visit(root, {
    onNode(node) {
      possibles.push(node.type)
      if (node.type === type && filter(node)) {
        matches.push(node)
      }
    }
  })
  if (matches.length === 0) {
    throw new Error(`Could NOT find node ${type}. Visited node types: ${possibles.join()}`)
  }
  return matches
}