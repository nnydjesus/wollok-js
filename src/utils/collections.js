
/* eslint prefer-spread: 0 */
export const flatten = list => [].concat.apply([], list)

export const isArray = o => Array.isArray(o)
export const array = o => (isArray(o) ? o : [o])

export const forAll = (array, predicate) => array.reduce((acc, e) => acc && predicate(e), true)
export const anySatisfy = (array, predicate) => array.reduce((acc, e) => acc || predicate(e), false)