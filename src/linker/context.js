
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
}

