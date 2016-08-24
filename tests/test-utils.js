var parser = require('../wollok')
var chai = require('chai')
var expect = chai.expect

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

module.exports = createTests
