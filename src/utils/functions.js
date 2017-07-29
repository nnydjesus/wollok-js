export const noop = () => {}
export const isFunction = o => typeof o === 'function'

// not sure how to support varargs, but I don't need them right now :P
export const pipe = (fns) => (arg) => fns.reduce((n, fn) => fn(n), arg)

/**
 * Wraps a function to only be called if a condition function is fulfilled
 */
export const filter = (condition, fn) => (...args) => {
  if (condition(...args)) {
    return fn(...args)
  }
}