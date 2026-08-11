require ('node:url')

const fs      = require ('fs');
const path    = require ('path')
const process = require ('process')


const MAX_CONFIG_FILE_SIZE = 10000

const {argv} = process; if (argv.length !== 3) throw Error (`Invalid command parameters. Usage: node ${path.basename (argv [1])} /path/to/config.json`)

const confPath = argv [2]; if (!fs.existsSync (confPath)) throw Error (`File not found: ${confPath}`)

const {size} = fs.statSync (confPath); if (size > MAX_CONFIG_FILE_SIZE) throw Error (`Suspiciously big config file ${confPath}: ${size} byte(s)`)

const conf = JSON.parse (fs.readFileSync (confPath))

if (!('workers' in conf)) {

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

if (!('http' in conf)) {

    throw Error (`conf.http not defined`)

}
else {

    const {http} = conf, type = typeof http

    if (type !== 'object') throw Error (`Illegal conf.http type: ${type} (must be object)`)

    if (http === null) throw Error (`Illegal conf.http: null`)

    if (!('listen' in http)) {
        
        throw Error (`conf.http.listen not defined`)
    
    }
    else {

        const {listen} = http, type = typeof listen

        if (type !== 'object') throw Error (`Illegal conf.http.listen type: ${type} (must be object)`)

        if (listen === null) throw Error (`Illegal conf.http.listen: null`)

    }

}

if (!('dbDw' in conf)) {

    throw Error (`conf.dbDw not defined`)

}
else {

    const {dbDw} = conf, type = typeof dbDw

    if (type !== 'object') throw Error (`Illegal conf.dbDw type: ${type} (must be object)`)

    if (dbDw === null) throw Error (`Illegal conf.http: null`)

    if (!('url' in dbDw)) {

        throw Error (`conf.dbDw.url not defined`)

    }
    else {

        const {url} = dbDw, type = typeof url

        if (type !== 'string') throw Error (`Illegal conf.dbDw.url type: ${type} (must be string)`)

        try {

            const u = new URL (url), {protocol} = u

            switch (protocol) {
                case 'http:':
                case 'https:':
                    break

                default:
                    throw Error (`the protocol expected to be 'http[s]:', not '${protocol}'`)

            }
            
        } 
        catch ({message}) {

            throw Error (`Illegal conf.dbDw.url '${url}': ${message}`)
            
        }

    }


    if (!('database' in dbDw)) {

        throw Error (`conf.dbDw.database not defined`)

    }
    else {

        const {database} = dbDw, type = typeof database

        if (type !== 'string') throw Error (`Illegal conf.dbDw.database type: ${type} (must be string)`)

        if (database.length === 0) throw Error (`Illegal (empty) conf.dbDw.database`)

    }

}

module.exports = conf