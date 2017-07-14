import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'

const isLinkeable = ({ type }) => linkeables[type]

export const linkStep = (node, unresolvables = []) => {
  visit(node, filtering(isLinkeable, {
    enter(n) {
      const { type } = n
      const name = linkeables[type](n)
      // HACK for now I need to resolve refs to wollok.lang.Object and friends !!!!!!! 
      if (name !== 'Object') {
        const found = findInScope(n, name)
        if (found) {
          n.link = found
        } else {
          unresolvables.push(name)
        }
      }
    }
  }))
  return { node, unresolvables }
}

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))