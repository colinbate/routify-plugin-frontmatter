const YAML = require('yaml')
const fs = require('fs')
const read = (filepath) => new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, content) => {
        if (err) {
            reject(err)
        } else {
            resolve(content)
        }
    })
})
const escape = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
const defaults = {
    extensions: ['md', 'svx'],
    delimiter: '---',
    parse: raw => YAML.parse(raw)
}

module.exports = function (middlewares, pl, options) {
    options = { ...defaults, ...options }
    // insert frontmatter metadata after meta is created
    const index = middlewares.findIndex(mw => mw.name === 'applyMetaToFiles')
    middlewares.splice(index + 1, 0, {
        name: 'routify-plugin-frontmatter',
        middleware: middleware
    })

    const matchers = [].concat(options.delimiter).map(d => {
        const open = d.open || d
        const close = d.close || d
        const pattern = new RegExp(`^${escape(open)}((?:.|[\\s\\S])+?)^${escape(close)}`, 'm');
        return { open, close, pattern }
    })

    return middlewares

    async function middleware(payload) { return Promise.all(walkFiles(payload.tree)) }

    function walkFiles(file) {
        const promises = file.children && file.children.length ?
            file.children.reduce((prev, curr) => prev.concat(walkFiles(curr)), []) : []
        if (options.extensions.includes(file.ext)) {
            promises.push(extract(file))
        }
        return promises;
    }

    async function extract(file) {
        const body = await read(file.absolutePath)
        for (let m = 0; m < matchers.length; m += 1) {
            const match = body.match(matchers[m].pattern)
            if (match) {
                file.meta.frontmatter = await options.parse(match[1], matchers[m].open, matchers[m].close)
                break;
            }
        }
    }
}