// const {exec}   = require ('node:child_process')
const fs       = require ('node:fs')
const Path     = require ('node:path')
const {rename} = require ('node:fs/promises')
const moment   = require ('moment')

module.exports = {

////////////////////////////////////////////////////////////////////////////////

doMove:

    async function () {

        const {src: {dirname: srcDir, datePattern}, request: {id}} = this

        const dstDir = Path.join (srcDir, 'old', moment (id, datePattern).format ('YYYY/MM/DD'))

        fs.mkdirSync (dstDir, {recursive: true})

        const src = Path.join (srcDir, id), dst = Path.join (dstDir, id)

        this.emit ('info', `${src} -> ${dst}`)

        await rename (src, dst)

        // setImmediate (() => this.app.run ({type: 'log', action: 'compress', id: dst}))

    },

////////////////////////////////////////////////////////////////////////////////

// doCompress:

//     async function () {

//         const src = this.request.id; return new Promise ((ok, fail) => exec (

//             `gzip -9 ${src}`,

//             err => err ? fail (err) : ok ())

//         )

//     },

}