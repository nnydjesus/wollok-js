import { last } from '../utils/collections'

export class Context {
  constructor() {
    this.context = []
  }

  peek() { return last(this.context) }
  push(c) { this.context.push(c) }
  pop() { this.context.pop() }

  register(referenciable, name) {
    const current = this.peek()
    current.scope = {
      ...(current && current.scope),
      [name]: referenciable
    }
  }
}

