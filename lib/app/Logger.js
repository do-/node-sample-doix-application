const fs               = require ('fs')
const Path             = require ('path')
const winston          = require ('winston')
const stringify        = require ('safe-stable-stringify')
const {normalizeSpace} = require ('string-normalize-space')
const {MESSAGE}        = require ('triple-beam')

const ARCHIVE_DIRECTORY_NAME = 'old'

const QUEUE_STATE = Symbol.for ('_QUEUE_STATE')

require ('winston-daily-rotate-file')

const CH_T   = 'T'.charCodeAt (0)
const CH_DOT = '.'.charCodeAt (0)
const df     = new Intl.DateTimeFormat ('sv', {
    year: 'numeric', 
    month: 'numeric',  
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
    fractionalSecondDigits: 3,
    hour12: false
})

class Format {

    transform (info) {

        let {id, level, message, event, details, isLast, isFirst, elapsed} = info

        if (details && details.maxSize && !details [QUEUE_STATE]) {

            const {size, maxSize} = details

            for (const k in details) if (k !== 'size' && k !== 'maxSize') {

                details = details [k]

                break

            }

            details [QUEUE_STATE] = {size, maxSize}

        }

        let s = `${df.format (new Date ())} ${id} `

        if (level !== 'info') {

            s += '! '
            s += normalizeSpace (message instanceof Error ? message.message + ' ' + message.stack : String (message))

        }
        else if (isLast) {

            s += isFirst ? '* ' : '< '

            if (typeof elapsed === 'number') {
                s += elapsed
                s += ' ms'
            }

            if (message !== event) {
                s += ' '
                s += normalizeSpace (String (message))
            }

        }
        else {

            s +=
                event === '+' ? '^ ' :
                event === '-' ? 'v ' :
                isFirst       ? '> ' :
                '- '

            if (details && details [QUEUE_STATE]) {

                const {size, maxSize} = details [QUEUE_STATE]

                s += `(${size}/${maxSize}) `

            }

            if (message != event) s += normalizeSpace (String (message))

        }

        if (details != null) {

            if (details instanceof Date) {

                const d = df.format (details)

                s += ` ${d.substring (0, 19)}.${d.substring (20)}`

            }
            else for (const _ in details) {

                s += ' '; try {
                    s += JSON.stringify (details)
                }
                catch (_) {
                    s += stringify (details)
                }

                break

            }

        }

        const b = Buffer.from (s)
        b [10] = CH_T
        b [19] = CH_DOT

        info [MESSAGE] = b.toString ()

        return info

    }

}

const format = new Format ()

module.exports = function (conf) {

    if (!('logs' in conf)) throw Error ('Invalid configuration: `logs` property not set')

    const {logs} = conf; if (typeof logs !== 'object') throw Error ('Invalid `logs` configuration property: ' + logs)

    const transports = []
    if (logs.console) transports.push (new winston.transports.Console ())
    if ('dir' in logs) {

        const {dir} = logs, old = logs.old = Path.join (dir, ARCHIVE_DIRECTORY_NAME)
        
        transports.push (new winston.transports.DailyRotateFile ({
            datePattern: "YYYY-MM-DD_HH",
            ...(logs.rotate ?? {}),
            filename: getFileName (dir, old),
            extension: '.log'
        }))

    }

    return winston.createLogger ({transports, format})

}

function getFileName (dir, old) {

    if (!fs.existsSync (dir)) throw Error (`Invalid "dir" configuration property: direcotory "${dir}" not found`)

    if (!fs.statSync (dir).isDirectory ()) throw Error (`Invalid "dir" configuration property: "${dir}" is not a direcotory`)

    const filename = Path.join (dir, 'app-%DATE%')

    try {

        fs.mkdirSync (old, {recursive: true})

        for (const d of [dir, old]) {

            const path = Path.join (d, '__DELETE_ME__')

            fs.closeSync (fs.openSync (path, 'w'))

            fs.rmSync (path)

        }

    }
    catch ({message}) {

        throw Error (`The logging directory "${dir}" is not writeable: ${message}`)

    }

    return filename

}