// TODO: Lint
/* eslint-disable */

export default {
  runtime: {
    isInteractive() { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Exception: {
    getFullStackTrace() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    getStackTrace() { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Object: {
    identity() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    instanceVariables() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    instanceVariableFor(name) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    resolve(name) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    kindName() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    className() { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Collection: {
    findOrElse(predicate, continuation) { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Set: {
    anyOne() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    fold(initialValue, closure) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    findOrElse(predicate, continuation) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    add(element) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    remove(element) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    size() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    clear() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    join(separator) { /* TODO:*/ if (arguments.length === 0 || arguments.length === 1) throw new ReferenceError('To be implemented') },
    equals(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '=='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  List: {
    get(index) { return this.$inner[index] },
    sortBy(closure) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    fold(initialValue, closure) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    findOrElse(predicate, continuation) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    add(element) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    remove(element) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    size() {
      const size = new Integer();
      size.$inner = this.$inner.length;
      return size
    },
    clear() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    join(separator) { /* TODO:*/ if (arguments.length === 0 || arguments.length === 1) throw new ReferenceError('To be implemented') },
    equals(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '=='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Dictionary: {
    put(_key, _value) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    basicGet(_key) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    remove(_key) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    keys() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    values() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    forEach(closure) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    clear() { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Integer: {
    '==='(other) { other.$inner? this.$inner === other.$inner: this.$inner === other},
    '+'(other) {
      const innerResponse = other.$inner ? this.$inner + other.$inner : this.$inner + other
      const response = innerResponse % 1 === 0 ? new Integer() : new Double()
      response.$inner = innerResponse
      return response
    },
    '-'(other) {
      const innerResponse = other.$inner ? this.$inner - other.$inner : this.$inner - other
      const response = innerResponse % 1 === 0 ? new Integer() : new Double()
      response.$inner = innerResponse
      return response
    },
    '*'(other) {
      const innerResponse = other.$inner ? this.$inner * other.$inner : this.$inner * other
      const response = innerResponse % 1 === 0 ? new Integer() : new Double()
      response.$inner = innerResponse
      return response
    },
    '/'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '**'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '%'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    div(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    toString() {return this.$inner },
    stringValue() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '>'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '>='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '<'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '<='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    abs() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    invert() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    gcd(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    randomUpTo(max) { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Double: {
    '==='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '+'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '-'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '*'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '/'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '**'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '%'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    div(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    stringValue() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '>'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '>='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '<'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '<='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    abs() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    invert() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    gcd(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    randomUpTo(max) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    roundUp(_decimals) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    truncate(_decimals) { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  String: {
    length() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    charAt(index) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '+'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    startsWith(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    endsWith(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    indexOf(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    lastIndexOf(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    toLowerCase() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    toUpperCase() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    trim() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '<'(aString) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '>'(aString) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    contains(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    substring(startIndex, length) { /* TODO:*/ if (arguments.length === 1 || arguments.length === 2) throw new ReferenceError('To be implemented') },
    replace(expression, replacement) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    toString() { return this.$inner },
    toSmartString(alreadyShown) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '=='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Boolean: {
    and(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '&&'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    or(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '||'(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    toString() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    toSmartString(alreadyShown) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '=='(other) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    negate() { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Range: {
    validate(_limit) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    forEach(closure) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    anyOne() { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Closure: {
    apply() { return this.$inner(...arguments) },
    toString() { /* TODO:*/ throw new ReferenceError('To be implemented') },
  },

  Date: {
    toString() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '=='(_aDate) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    plusDays(_days) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    plusMonths(_months) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    plusYears(_years) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    isLeapYear() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    initialize(_day, _month, _year) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    day() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    dayOfWeek() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    month() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    year() { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '-'(_aDate) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    minusDays(_days) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    minusMonths(_months) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    minusYears(_years) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '<'(_aDate) { /* TODO:*/ throw new ReferenceError('To be implemented') },
    '>'(_aDate) { /* TODO:*/ throw new ReferenceError('To be implemented') },
  }
}