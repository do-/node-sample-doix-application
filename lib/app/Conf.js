const fs      = require ('fs');
const path    = require ('path')
const process = require ('process')

const MAX_CONFIG_FILE_SIZE = 10000

const {argv} = process; if (argv.length !== 3) throw Error (`Invalid command parameters. Usage: node ${path.basename (argv [1])} /path/to/config.json`)

const confPath = argv [2]; if (!fs.existsSync (confPath)) throw Error (`File not found: ${confPath}`)

const {size} = fs.statSync (confPath); if (size > MAX_CONFIG_FILE_SIZE) throw Error (`Suspiciously big config file ${confPath}: ${size} byte(s)`)

const conf = JSON.parse (fs.readFileSync (confPath))

if (!('workers') in conf) {

    throw Error (`conf.workers not defined`)

}
else {

    const MAX_WORKERS = (require ('node:os')).availableParallelism ()

    if (conf.workers === null) conf.workers = MAX_WORKERS

    const {workers} = conf, type = typeof workers

    if (type !== 'number') throw Error (`Illegal conf.workers type: ${type} (must be number)`)

    if (!Number.isSafeInteger (workers)) throw Error (`Illegal conf.workers value: ${workers} (must be an integer)`)

    if (workers < 1)           throw Error (`Illegal conf.workers value: ${workers} (must be at least 1, null for default)`)

    if (workers > MAX_WORKERS) throw Error (`Incorrect conf.workers value: ${workers}: max ${MAX_WORKERS} available; set null for default`)

}

module.exports = conf