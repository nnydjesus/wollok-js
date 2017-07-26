
export const propertyValues = object => Object.keys(object).map(name => ({
  name,
  value: object[name]
}))