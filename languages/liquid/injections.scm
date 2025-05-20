((template_content)+ @injection.content
  (#set! injection.language "html"))

(javascript_statement
  (js_content)+ @injection.content
  (#set! injection.language "javascript"))

(schema_statement
  (json_content)+ @injection.content
  (#set! injection.language "json"))

(style_statement
  (style_content)+ @injection.content
  (#set! injection.language "css"))

((front_matter)+ @injection.content
  (#set! injection.language "yaml"))

((comment)+ @injection.content
  (#set! injection.language "comment"))
