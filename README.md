# wollok-js
Wollok Parser and Interpreter for Javascript


## Building

Every time you change the **wollok.pegjs** grammar file you need to run

```bash
pegjs wollok.pegjs
```

This will generate **wollok.js** parser.

## Testing

TODO: current tests are just smoke tests for the parser.
Eventually we would need to add mocha or some other framework with Grunt.


## Links

See SQL example in PEG grammar https://github.com/alsotang/sql.pegjs/blob/master/lib/sql.pegjs