var createTests = require('./test-utils')

describe('Parsing Objects', function() {

    describe('Simple objects', function() {
        createTests({

            // TODO: MUST FAIL "object pepita" : { imports : [], elements: [ { type:'object', name:'pepita', members:[] }] },

            "object pepita {}" : { imports : [], elements: [ { type:'object', name:'pepita', members:[] }] },

            "object pepita {\n}" : { imports : [], elements: [ { type:'object', name:'pepita', members:[] }] },

            "object pepita {\nvar energy = 100}" : { imports : [], elements: [ {
                type:'object',
                name:'pepita',
                members:[
                    {
                        type: "reference",
                        name : "energy",
                        mutable : true,
                        initValue : "100"
                    }
                ]
            }] },

            "object pepita {\nconstructor()}" : { imports : [], elements: [ {
                type:'object',
                name:'pepita',
                members:[{
                    type: 'constructor',
                    parameters : []
                }]
            }] },

            "object pepita {\nconstructor(a)}" : { imports : [], elements: [ {
                type:'object',
                name:'pepita',
                members:[{
                    type: 'constructor',
                    parameters : [ {name:"a"} ]
                }]
            }] },

            "object pepita {\nconstructor(a, b)}" : { imports : [], elements: [ {
                type:'object',
                name:'pepita',
                members:[{
                    type: 'constructor',
                    parameters : [ {name:"a"}, {name: "b"} ]
                }]
            }] }
        })
    })

})


