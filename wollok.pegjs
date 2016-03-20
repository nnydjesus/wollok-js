wfile
   = (imports: Import whitespace)*
     (elements : WLibraryElement whitespace)*

Import
	= IMPORT_KW whitespace1 QualifiedNameWithWildcard semicolon?

IMPORT_KW =
  whitespace "import"i

WLibraryElement
	= (OBJECT_KW whitespace1 ID)

OBJECT_KW
	= whitespace "object"i 

// BASICS

QualifiedName = ID ('.' ID)*

QualifiedNameWithWildcard = QualifiedName ('.' '*')?;

ID =
  str:[A-Za-z0-9_]+
  { return str.join('') }



// tokens

whitespace =
  [ \t\n\r]*

whitespace1 =
  [ \t\n\r]+

semicolon = ';'

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