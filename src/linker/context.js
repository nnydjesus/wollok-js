import { ExtendableError } from '../utils/error'

export class LinkerError extends ExtendableError { }

export class Context {
  constructor() {
    this.context = []
  }

  peek() { return (this.context.length > 0 ? this.context[this.context.length - 1] : undefined) }
  push(c) { this.context.push(c) }
  pop() { this.context.pop() }

  register(referenciable, name) {
    const current = this.peek()
    current.scope = {
      ...(current && current.scope),
      [name]: referenciable
    }
  }
  resolve(name) {
    // TODO: in the future this won't fail here.
    //  it should leave a mark on the node so that we can report
    //  more than one linkage error at once, instead of reporting them one by one.
    return failIfNotFound(this.context.reduceRight(
      (found, { scope }) => found || (scope && scope[name]),
      undefined
    ), `Cannot resolve reference to '${name}' at ???`)
  }
}

const failIfNotFound = (value, message) => {
  if (!value) throw new LinkerError(message)
  return value
}