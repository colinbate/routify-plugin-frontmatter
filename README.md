# Routify Frontmatter Plugin

Extracts frontmatter from Markdown or MDSveX files. Supports YAML by default, but can be configured for any type of delimiters or parser.

## Usage

In your `routify.config.js` or `package.json` insert

```json
  "routify": {
    "plugins":
      {
        "routify-plugin-frontmatter": {}
      }
  }
```

Frontmatter metadata can be found in ``meta.frontmatter`` of the respective file.

To change extensions (default: `md` and `svx`)

```json
{ "routify-plugin-frontmatter": { "extensions": ["md"] } }
```

### Custom Parser

To set custom a custom parser, you will need to use the `routify.config.js` config option as you will need to export a function. For example, if you want to parse TOML frontmatter, you might create a `routify.config.js` like this:

```js
const toml = require('@iarna/toml/parse-string');

module.exports = {
  plugins: {
    'routify-plugin-frontmatter': {
      delimiter: '+++',
      parse(raw) {
        return toml(raw);
      }
    }
  }
};
```

The `delimiter` option can take an array of strings, or an array of or single object of the shape: `{open: "<<<", close: ">>>"}` to support different open and close delimiters. If it matches one of the delimiter pairs, it will pass the raw text to the `parse()` method. It also passes the open and closing delimiter as the second and third parameter to `parse` so you can use that to determine the type of parsing needed. The `parse` method can be `async` if needed.


## Note

This plugin does not strip frontmatter from your file. It only reads it and adds it to your metadata.