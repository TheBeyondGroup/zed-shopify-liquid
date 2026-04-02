((comment) @comment
  (#set! priority 120))

; Base doc styling - colors everything in doc as comment (green)
((doc) @comment
  (#set! priority 120))

((doc_content) @comment
  (#set! priority 121))

((doc_description_annotation) @keyword
  (#set! priority 122))

("@param" @keyword
  (#set! priority 122))

("@example" @keyword
  (#set! priority 122))

((doc_param_name) @variable
  (#set! priority 122))

((doc_type) @type
  (#set! priority 122))

; Override example content so it's not styled as comment
((doc_example_content) @embedded
  (#set! priority 125))

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
  "doc"
  "echo"
  "endcapture"
  "enddoc"
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
