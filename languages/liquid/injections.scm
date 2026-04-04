((template_content) @injection.content
  (#set! injection.language "html")
  (#set! injection.combined))

(javascript_statement
  (js_content) @injection.content
  (#set! injection.language "javascript")
  (#set! injection.combined))

(schema_statement
  (json_content) @injection.content
  (#set! injection.language "json")
  (#set! injection.combined))

; CSS in {% style %} — top-level (template_content aliased as style_content in grammar)
(style_statement
  (style_content) @injection.content
  (#set! injection.language "css")
  (#set! injection.combined))

; CSS in {% style %} — nested one level deep inside Liquid control flow (if/for/unless/etc.)
(style_statement
  (_
    (block
      (template_content) @injection.content))
  (#set! injection.language "css")
  (#set! injection.combined))

; CSS in {% style %} — nested two levels deep (else/elsif clauses, or 2-level nesting)
(style_statement
  (_
    (_
      (block
        (template_content) @injection.content)))
  (#set! injection.language "css")
  (#set! injection.combined))

; CSS in {% stylesheet %} — top-level
(stylesheet_statement
  (stylesheet_content) @injection.content
  (#set! injection.language "css")
  (#set! injection.combined))

; CSS in {% stylesheet %} — nested one level deep
(stylesheet_statement
  (_
    (block
      (template_content) @injection.content))
  (#set! injection.language "css")
  (#set! injection.combined))

; CSS in {% stylesheet %} — nested two levels deep
(stylesheet_statement
  (_
    (_
      (block
        (template_content) @injection.content)))
  (#set! injection.language "css")
  (#set! injection.combined))

((front_matter) @injection.content
  (#set! injection.language "yaml"))

((comment) @injection.content
  (#set! injection.language "comment"))

(doc_example_annotation
  (doc_example_content) @injection.content
  (#set! injection.language "liquid"))
