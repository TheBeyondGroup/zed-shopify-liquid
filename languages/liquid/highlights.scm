((comment) @comment @spell
  (#set! priority 110))

(raw_statement
  (raw_content) @spell
  (#set! priority 110))

(argument
  key: (identifier) @variable.parameter
  (#set! priority 111))

((identifier) @variable
  (#set! priority 110))

((string) @string
  (#set! priority 110))

((boolean) @boolean
  (#set! priority 110))

((number) @number
  (#set! priority 110))

(filter
  name: (identifier) @function.call
  (#set! priority 110))

([
  "as"
  "assign"
  "capture"
  (custom_unpaired_statement)
  "decrement"
  "echo"
  "endcapture"
  "endform"
  "endjavascript"
  "endraw"
  "endschema"
  "endstyle"
  "endstylesheet"
  "form"
  "increment"
  "javascript"
  "layout"
  "liquid"
  "raw"
  "schema"
  "style"
  "stylesheet"
  "with"
] @keyword
  (#set! priority 110))

([
  "case"
  "else"
  "elsif"
  "endcase"
  "endif"
  "endunless"
  "if"
  "unless"
  "when"
] @keyword.conditional
  (#set! priority 110))

([
  (break_statement)
  (continue_statement)
  "by"
  "cycle"
  "endfor"
  "endpaginate"
  "endtablerow"
  "for"
  "paginate"
  "tablerow"
] @keyword.repeat
  (#set! priority 110))

([
  "and"
  "contains"
  "in"
  "or"
] @keyword.operator
  (#set! priority 110))

([
  "{{"
  "}}"
  "{{-"
  "-}}"
  "{%"
  "%}"
  "{%-"
  "-%}"
] @punctuation.special
  (#set! priority 110))

[
  "include"
  "include_relative"
  "render"
  "section"
  "sections"
] @keyword.import

[
  "|"
  ":"
  "="
  "+"
  "-"
  "*"
  "/"
  "%"
  "^"
  "=="
  "<"
  "<="
  "!="
  ">="
  ">"
] @operator

[
  "]"
  "["
  ")"
  "("
] @punctuation.bracket

[
  ","
  "."
] @punctuation.delimiter
