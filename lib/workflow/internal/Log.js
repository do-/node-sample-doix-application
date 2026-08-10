const {exec}   = require ('node:child_process');
const fs       = require ('node:fs')
const Path     = require ('node:path')
const {rename} = require ('node:fs/promises')

const NOP = _ => _

const RE_YMD = /(\d\d\d\d)\D(\d\d)\D(\d\d)/

module.exports = {

////////////////////////////////////////////////////////////////////////////////

doMove:

    async function () {

        const src = this.request.id, fn = Path.basename (src), ymd = fn.match (RE_YMD); if (!ymd) throw Error (`Cannot parse date from "${fn}"`)

        const dir = Path.join (Path.dirname (src), 'old', ymd [1], ymd [2], ymd [3]); fs.mkdirSync (dir, {recursive: true})

        const dst = Path.join (dir, fn); await rename (src, dst)

        setImmediate (() => this.app.exec ({type: 'log', action: 'compress', id: dst}).then (NOP, NOP))

    },

////////////////////////////////////////////////////////////////////////////////

doCompress:

    async function () {

        const src = this.request.id; return new Promise ((ok, fail) => exec (

            `gzip -9 ${src}`,

            err => err ? fail (err) : ok ())

        )

    },

}