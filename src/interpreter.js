import compile from './compiler'

export default (ast) => eval(compile(ast))
