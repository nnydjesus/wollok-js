{
	function s(obj, property) {
		return obj.hasOwnProperty(property) ? obj[property] : undefined 
	}
}


wfile
   = (imports: (Import whitespace)*)
     (elements : (WLibraryElement whitespace)*)
     {
     	return {
     		imports : imports,
     		elements : elements
     	}
     }

Import
	= KW_IMPORT whitespace1 QualifiedNameWithWildcard semicolon?

WLibraryElement
	= WPackage / WClass / WNamedObject / WMixin

WPackage
	= KW_PACKAGE whitespace1 QualifiedName

WClass
	= KW_CLASS whitespace1 ID

WNamedObject
	= (
		KW_OBJECT whitespace1 (name: ID) 
		(body : WNamedObjectBody?)
	)
	{
		return { 
			name : name,
			members : body ? body.members : undefined
		}
	}

WNamedObjectBody
	= (
		whitespace1 lcurlybracket
		(instanceVariables: WVariableDeclaration*)
		whitespace rcurlybracket
	  ) {
	    var members = []
	    instanceVariables.forEach(function(i) { members.push(i) })
		return { members : members }
	  }

WMixin
	= KW_MIXIN whitespace1 ID

WVariableDeclaration
	= KW_VAR whitespace1 (name:ID) (right : WVariableRightSide?) {
		return {
			name : name,
			initValue : right ? right.initValue : undefined
		}
	}

WVariableRightSide
	= whitespace SYM_ASSIGNMENT whitespace (initValue:ID) {
		return { initValue: initValue }
	}

// BASICS

QualifiedName = ID ('.' ID)*

QualifiedNameWithWildcard = QualifiedName ('.' '*')?;

ID =
  str:[A-Za-z0-9_]+
  { return str.join('') }

// KEYWORDS

KW_IMPORT = whitespace "import"i
KW_PACKAGE = whitespace "package"i
KW_OBJECT = whitespace "object"i 
KW_CLASS = whitespace "class"i 
KW_MIXIN = whitespace "mixin"i 
KW_VAR = whitespace "var"i 

// SYMBOLS

SYM_ASSIGNMENT = '='

// tokens

whitespace =
  [ \t\n\r]*

whitespace1 =
  [ \t\n\r]+

semicolon = ';'
lcurlybracket = '{'
rcurlybracket = '}'

// arithmetic example

start
  = additive

additive
  = left:multiplicative "+" right:additive { return left + right; }
  / multiplicative

multiplicative
  = left:primary "*" right:multiplicative { return left * right; }
  / primary

primary
  = integer
  / "(" additive:additive ")" { return additive; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }