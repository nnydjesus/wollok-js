
/* eslint prefer-spread: 0 */
export const flatten = list => [].concat.apply([], list)

export const isArray = o => Array.isArray(o)
export const array = o => (isArray(o) ? o : [o])