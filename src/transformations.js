import { Assignment, Block, Catch, Class, Closure, Constructor, Field, File, If, List, Method, Module, New, Node, Package, Return, Runnable, Send, Super, Try, VariableDeclaration, traverse } from './model'

export const addDefaultConstructor = traverse({
  [File]: ({ content }) => File(...content.map(addDefaultConstructor)),
  [Class]: (node) => (node.members.some(c => c.is(Constructor)) ? node : node.copy({ members: ms => [Constructor()()(), ...ms] })),
  [Node]: (node) => node
})

// TODO: Test this
export const map = config => {
  const tx = traverse(config)
  return traverse({
    [File]: node => tx(node).copy({ content: node.content.map(map(tx)) }),
    [Block]: node => tx(node).copy({ sentences: node.sentences.map(map(tx)) }),
    [Package]: node => tx(node).copy({ elements: node.elements.map(map(tx)) }),
    [Module]: node => tx(node).copy({ members: node.members.map(map(tx)) }),
    [Runnable]: node => tx(node).copy({ sentences: map(tx) }),
    [Field]: node => tx(node).copy({ variable: map(tx), value: map(tx) }),
    [Method]: node => tx(node).copy({ parameters: node.parameters.map(map(tx)), sentences: map(tx) }),
    [Constructor]: node => tx(node).copy({ parameters: node.parameters.map(map(tx)), sentences: map(tx), baseArguments: node.baseArguments.map(map(tx)) }),
    [VariableDeclaration]: node => tx(node).copy({ variable: map(tx), value: map(tx) }),
    [Return]: node => tx(node).copy({ result: map(tx) }),
    [Assignment]: node => tx(node).copy({ variable: map(tx), value: map(tx) }),
    [List]: node => tx(node).copy({ values: node.values.map(map(tx)) }),
    [Closure]: node => tx(node).copy({ parameters: node.parameters.map(map(tx)), sentences: map(tx) }),
    [Send]: node => tx(node).copy({ target: map(tx), parameters: node.parameters.map(map(tx)) }),
    [Super]: node => tx(node).copy({ parameters: node.parameters.map(map(tx)) }),
    [New]: node => tx(node).copy({ parameters: node.parameters.map(map(tx)) }),
    [If]: node => tx(node).copy({ condition: map(tx), thenSentences: map(tx), elseSentences: map(tx) }),
    [Try]: node => tx(node).copy({ sentences: map(tx), catches: map(tx), always: map(tx) }),
    [Catch]: node => tx(node).copy({ variable: map(tx), handler: map(tx) }),
    [Node]: node => tx(node)
  })
}