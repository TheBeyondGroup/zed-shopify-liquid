# Shopify Liquid Extension for Zed

This extension adds syntax highlighting for Liquid to Zed.

# For Prettier Formatting, add this in your zed setting
```json
  "languages": {
    "Liquid": {
      "prettier": {
        "allowed": true,
        "plugins": ["@shopify/prettier-plugin-liquid"]
      }
    }
  }
```

More work is needed to bring this extension in line with vscode plugin, so
contributions are welcome!

## Credits

This extension uses [grammar](https://github.com/hankthetank27/tree-sitter-liquid) and queries from [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter/tree/master/queries/liquid)
