import winston from 'winston'

// winston.level = 'silly'

// this should be in the linker !
const ignoredKeys = ['parent', 'link']

export const visit = (node, { enter, exit = () => {} }, parent) => {
  if (!node.type) { return node }
  winston.silly(`visiting ${node.type}`)
  enter(node, parent)
  Object.keys(node).forEach(key => {
    if (ignoredKeys.includes(key)) return
    const value = node[key]
    const list = Array.isArray(value) ? value : (value && [value] || [])
    list.filter(e => e.type).forEach((e, i) => {
      winston.silly(`\tvisiting ${node.type}.${key}[${i}]`)
      visit(e, { enter, exit }, node)
    })
  })
  exit(node)
  return node
}

export const queryNodeByType = (root, type, filter = () => true) => {
  const possibles = []
  const matches = []

  visit(root, {
    enter(node) {
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