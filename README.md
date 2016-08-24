# Wollok JS [![Build Status](https://travis-ci.org/uqbar-project/wollok-js.svg?branch=master)](https://travis-ci.org/uqbar-project/wollok-js)
Wollok Parser and Interpreter for Javascript


## Changing the Grammar

Every time you change the **wollok.pegjs** grammar file you **regenerate the parser** 
There are two ways, manually:


```bash
pegjs wollok.pegjs
```

This will generate **wollok.js** parser.

Or through gulp

```bash
gulp generate:parser
```

## Testing

To test run gulp

```bash
gulp test
```

The **default** gulp tasks generates the parser and runs the test

```bash
gulp
```


## Links

See SQL example in PEG grammar https://github.com/alsotang/sql.pegjs/blob/master/lib/sql.pegjs
