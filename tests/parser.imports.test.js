var createTests = require('./test-utils')

describe('Parsing Imports', function() {
  
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


