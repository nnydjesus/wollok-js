{
	function s(obj, property) {
		return obj.hasOwnProperty(property) ? obj[property] : undefined 
	}
}

WFile
   = (imports: (i:Import whitespace { return i })*)
     (elements : (e:WLibraryElement whitespace { return e })*)
     {
     	return {
     		imports : imports,
     		elements : elements
     	}
     }

Import
	= KW_IMPORT whitespace1 name:QualifiedNameWithWildcard semicolon? {
		return {
			fqn : name.fqn.elements,
			isWildcard : name.isWildcard
		}
	}

WLibraryElement
	= WPackage / WClass / WNamedObject / WMixin

WPackage
	= KW_PACKAGE whitespace1 QualifiedName

WClass
	= KW_CLASS whitespace1 ID

WNamedObject
	=	KW_OBJECT whitespace1 name:ID whitespace1 lcurlybracket
		(body: (b: WNamedObjectBody {return b})?)
		whitespace rcurlybracket
	{
		return {
			type : 'object',
			name : name,
			members : body ? body.members : []
		}
	}

WNamedObjectBody
	=
	  instanceVariables : WVariableDeclaration*
	  constructors : WConstructor*
	  {
	    var members = []
	    instanceVariables.forEach(function(i) { members.push(i) })
	    constructors.forEach(function(i) { members.push(i) })
		return { members : members }
	  }

WMixin
	= KW_MIXIN whitespace1 ID

WVariableDeclaration
	= KW_VAR whitespace1 name:ID right:WVariableRightSide? {
		return {
		    type : 'reference',
		    mutable : true,
			name : name,
			initValue : right ? right.initValue : undefined
		}
	}

WConstructor
    = KW_CONSTRUCTOR
    lparenthesis params:WParameterList? rparenthesis {
        return {
            type : 'constructor',
            parameters : params ? params : []
        }
    }
WParameterList
    = p:WParameter rest:(whitespace comma whitespace o:WParameter {return o})* {
        var a = p ? [p] : []
        return rest ? a.concat(rest) : a
    }

WVariableRightSide
	= whitespace SYM_ASSIGNMENT whitespace (initValue:ID) {
		return { initValue: initValue }
	}

WParameter = name:ID {
    return { name : name }
}

// BASICS

QualifiedName = name:ID elements:('.' i:ID { return i })* {
	var parts = [name]
	elements.forEach(function(e) {
		parts.push(e)
	})
	return {
		elements: parts
	}
}

QualifiedNameWithWildcard = fqn:QualifiedName wildcard:('.' '*')? {
	return {
		fqn : fqn,
		isWildcard : !!wildcard
	}
}

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
KW_CONSTRUCTOR = whitespace "constructor"i

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
lparenthesis = '('
rparenthesis = ')'
comma = ','

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