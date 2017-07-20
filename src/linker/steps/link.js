import { visit } from '../../visitors/visiting'
import { filtering } from '../../visitors/commons'
import { linkeables } from '../definitions'

const isLinkeable = ({ type }) => linkeables[type]

export const linkStep = (node, unresolvables = []) => {
  visit(node, filtering(isLinkeable, {
    enter(n) {
      const { type } = n
      const name = linkeables[type](n)
      // TODO: HACK for now I need to resolve refs to wollok.lang.* and friends !!!!!!! 
      // TODO: Not sure what to do with self references.
      const tempIgnore = ['Object', 'console', 'StringPrinter', 'wollok.lang.Exception', 'runtime', 'Exception', 'self']
      if (tempIgnore.indexOf(name) < 0) {
        const found = findInScope(n, name)
        if (found) {
          n.link = found
        } else {
          unresolvables.push(name)
        }
      } else {
        n.link = n
      }
    }
  }))
  return { node, unresolvables }
}

const findInScope = (node, name) =>
  node && ((node.scope && node.scope[name]) || findInScope(node.parent, name))