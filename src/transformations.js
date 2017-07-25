import { Class, Constructor, Node, File, traverse } from './model'

export const addDefaultConstructor = traverse({
  [File]: ({ content }) => File(...content.map(addDefaultConstructor)),
  [Class]: (node) => (node.members.some(c => c.is(Constructor)) ? node : node.copy({ members: ms => [Constructor()()(), ...ms] })),
  [Node]: (node) => node
})