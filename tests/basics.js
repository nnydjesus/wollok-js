var parser = require('../wollok')

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

function expectParsing(text, ast) {
	expect(parser.parse(text)).to.deep.equal(ast);
}

function createTests(tests) {
	Object.keys(tests).forEach(function(text) {
  		it(text, function(done) {
			expectParsing(text, tests[text])
			done()
		})
  	})
}


describe('Parsing', function() {
  
  describe('simple imports', function() {
  	createTests({
  		"import a" : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		"import a;" : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		" import a" : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		" import a " : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		" import a   " : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		"import a; import b" : { imports : [ { fqn : ['a'], isWildcard:false }, { fqn : ['b'], isWildcard:false } ], elements: [] },
  		"import a\nimport b" : { imports : [ { fqn : ['a'], isWildcard:false }, { fqn : ['b'], isWildcard:false } ], elements: [] },
  		"import a\nimport b\nimport c" : { imports : [ { fqn : ['a'], isWildcard:false }, { fqn : ['b'], isWildcard:false }, { fqn : ['c'], isWildcard:false } ], elements: [] }
  	})
  })

  describe('nested imports', function() {
  	createTests({
  		"import a.b" : { imports : [ { fqn : ['a', 'b'], isWildcard:false } ], elements: [] },
  		"import a.b.c.d.e.f.g.h.*" : { imports : [ { fqn : ['a','b','c','d','e','f','g','h'], isWildcard:true } ], elements: [] }
  	})
  })

})

// ERROR content = parser.parse(" import ")
// ERROR content = parser.parse("import")
// ERROR content = parser.parse("import a.b.c.")
// ERROR content = parser.parse("import *")


content = parser.parse("object pepita")
console.log(JSON.stringify(content))

content = parser.parse("object pepita {}")
content = parser.parse("object pepita { var energia }")
console.log(JSON.stringify(content))
content = parser.parse("object pepita { var energia = 100 }")
console.log(JSON.stringify(content))

content = parser.parse("package unpaquete")
content = parser.parse(" package unpaquete ")


