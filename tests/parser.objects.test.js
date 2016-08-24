var createTests = require('./test-utils')

describe('Parsing Objects', function() {

    describe('Simple objects', function() {
        createTests({
            // MUST FAIL "object pepita" : { imports : [], elements: [ { type:'object', name:'pepita', members:[] }] },
            "object pepita {}" : { imports : [], elements: [ { type:'object', name:'pepita', members:[] }] },
            "object pepita {\n}" : { imports : [], elements: [ { type:'object', name:'pepita', members:[] }] },
        })
    })

})


