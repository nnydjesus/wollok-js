import winston from 'winston'

const ignoredKeys = ['parent', 'link']

export const visit = (node, fn, after = () => {}) => {
  fn(node)
  Object.keys(node).forEach(key => {
    if (ignoredKeys.includes(key)) return
    const value = node[key]
    const list = Array.isArray(value) ? value : [value]
    list.filter(e => e.nodeType).forEach((e, i) => {
      winston.error(`visiting ${node.nodeType}.${key}[${i}]`)
      visit(e, fn, after)
    })
  })
  after(node)
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