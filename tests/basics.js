var parser = require('../wollok')

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

function expectParsing(text, ast) {
	expect(parser.parse(text)).to.deep.equal(ast);
}


describe('Parsing', function() {
  
  describe('imports', function() {
  	var tests = {
  		"import a" : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		"import a;" : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		" import a" : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		" import a " : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		" import a   " : { imports : [ { fqn : ['a'], isWildcard:false } ], elements: [] },
  		"import a; import b" : { imports : [ { fqn : ['a'], isWildcard:false }, { fqn : ['b'], isWildcard:false } ], elements: [] }
  	}


  	Object.keys(tests).forEach(function(text) {
  		it(text, function(done) {
			expectParsing(text, tests[text])
			done()
		})
  	})
  	
  })

})

// ERROR content = parser.parse(" import ")
// ERROR content = parser.parse("import")


var content = parser.parse("import a; import b")

content = parser.parse("import a\nimport b")
content = parser.parse("import a\nimport b\nimport c")


content = parser.parse("import a.b")
content = parser.parse("import a.b.c")
content = parser.parse("import a.b.c.d.e.f.g.h")
// ERROR content = parser.parse("import a.b.c.")


content = parser.parse("import a.*")
content = parser.parse("import a.b.c.d.e.f.g.h.*")
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


