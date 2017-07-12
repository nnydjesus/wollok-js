import compile from './compiler'

const { is } = Object
const { max } = Math

Boolean.prototype['||'] = function (other) { return this || other }
Boolean.prototype.or = function (other) { return this || other }
Boolean.prototype['&&'] = function (other) { return this && other }
Boolean.prototype.and = function (other) { return this && other }
Boolean.prototype['==='] = function (other) { return is(this, other) }
Boolean.prototype['!=='] = function (other) { return !is(this, other) }
Boolean.prototype['=='] = function (other) { return this === other }
Boolean.prototype['!='] = function (other) { return this !== other }
Boolean.prototype['!_'] = function () { return !this }
Boolean.prototype.not_ = function () { return !this }

Number.prototype['==='] = function (other) { return is(this, other) }
Number.prototype['!=='] = function (other) { return !is(this, other) }
Number.prototype['=='] = function (other) { return this === other }
Number.prototype['!='] = function (other) { return this !== other }
Number.prototype['>='] = function (other) { return this >= other }
Number.prototype['<='] = function (other) { return this <= other }
Number.prototype['>'] = function (other) { return this > other }
Number.prototype['<'] = function (other) { return this < other }
Number.prototype['+'] = function (other) { return this + other }
Number.prototype['-'] = function (other) { return this - other }
Number.prototype['**'] = function (other) { return this ** other }
Number.prototype['*'] = function (other) { return this * other }
Number.prototype['/'] = function (other) { return this / other }
Number.prototype['%'] = function (other) { return this % other }
Number.prototype['..'] = function (other) { return new Array(max(0, other - this + 1)).map((e, i) => i + this) }
Number.prototype['..<'] = function (other) { return this['..'](other) - 1 }
Number.prototype['>..'] = function (other) { return (this + 1)['..'](other) }
Number.prototype['-_'] = function () { return -this }

export default (ast) => eval(compile(ast))
