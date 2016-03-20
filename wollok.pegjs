wfile
   = (imports: Import whitespace)*
     (elements : WLibraryElement whitespace)*

Import
	= KW_IMPORT whitespace1 QualifiedNameWithWildcard semicolon?

WLibraryElement
	= WPackage / WClass / WNamedObject / WMixin

WPackage
	= KW_PACKAGE whitespace1 QualifiedName

WClass
	= KW_CLASS whitespace1 ID

WNamedObject
	= KW_OBJECT whitespace1 (name: ID) (whitespace1 lcurlybracket
		rcurlybracket)?

	{
		return { 
			name : name
		}
	}

WMixin
	= KW_MIXIN whitespace1 ID

WVariableDeclaration
	= KW_VAR whitespace1 ID

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