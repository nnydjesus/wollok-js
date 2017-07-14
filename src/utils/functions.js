// not sure how to support varargs, but I don't need them right now :P
export const pipe = (fns) => (arg) => fns.reduce((n, fn) => fn(n), arg)