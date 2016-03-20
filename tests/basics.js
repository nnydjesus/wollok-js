var parser = require('../wollok')

var content = parser.parse("import a")
var content = parser.parse("import a;")
content = parser.parse(" import a")
content = parser.parse(" import a ")
content = parser.parse(" import a   ")
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


