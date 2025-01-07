# Shopify Liquid Extension for Zed

This extension adds syntax highlighting for Liquid to Zed.

More work is needed to bring this extension in line with vscode plugin, so
contributions are welcome!

> [!CAUTION]
> The injections.scm used by this plugin considers the template
> content to only be HTML.
>
> *.js.liquid will not have correctly highlighted JS. No info is derived
> from the file extension to set the base file type.
>
> How to deal with this will come in the future.

## Credits

This extension uses [grammar](https://github.com/hankthetank27/tree-sitter-liquid) and queries from [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter/tree/master/queries/liquid)
