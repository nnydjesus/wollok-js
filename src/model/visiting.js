import winston from 'winston'

// this should be in the linker !
const ignoredKeys = ['parent', 'link']

export const visit = (node, fn, after = () => {}, parent) => {
  if (!node.nodeType) { return node }
  winston.silly(`visiting ${node.nodeType}`)
  fn(node, parent)
  Object.keys(node).forEach(key => {
    if (ignoredKeys.includes(key)) return
    const value = node[key]
    const list = Array.isArray(value) ? value : [value]
    list.filter(e => e.nodeType).forEach((e, i) => {
      winston.silly(`\tvisiting ${node.nodeType}.${key}[${i}]`)
      visit(e, fn, after, node)
    })
  })
  after(node)
  return node
}

export const visitor = object => node => visit(node,
  n => methodByConvention(object, n, 'visit'),
  n => methodByConvention(object, n, 'after')
)

function methodByConvention(object, node, preffix) {
  const method = object[`${preffix}${node.nodeType}`]
  if (method) {
    method(node)
  }
}

export const queryNodeByType = (root, type, filter = () => true) => {
  const possibles = []
  const matches = []
  visit(root, node => {
    possibles.push(node.nodeType)
    if (node.nodeType === type && filter(node)) {
      matches.push(node)
    }
  })
  if (matches.length === 0) {
    throw new Error(`Could NOT find node ${type}. Visited node types: ${possibles.join()}`)
  }
  return matches
}