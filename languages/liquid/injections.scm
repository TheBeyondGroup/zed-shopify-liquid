((template_content) @content
  (#set! "language" "html")
  (#set! "combined"))

(javascript_statement
  (js_content) @content
  (#set! "language" "javascript")
  (#set! "combined"))

(schema_statement
  (json_content) @content
  (#set! "language" "json")
  (#set! "combined"))

(style_statement
  (style_content) @content
  (#set! "language" "css")
  (#set! "combined"))

((comment) @content
  (#set! "language" "comment"))
