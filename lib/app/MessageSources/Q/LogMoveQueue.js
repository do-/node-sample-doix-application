const  moment              = require ('moment')
const {FileDirectoryQueue} = require ('doix')

const DATE_TOKEN = '%DATE%'

module.exports = class LogMoveQueue extends FileDirectoryQueue {

    constructor (app) {

        const transport = app.logger.transports.find (t => 'logStream' in t); if (!transport) throw Error (`No winston.transports.DailyRotateFile instance found`)

        const {logStream, dirname, filename, options: {datePattern, extension}} = transport

        super (app, {
            name: 'log_move',
            request: {
                type: 'log', 
                action: 'move'
            },
            dirname
        })

        this.datePattern = datePattern
        this.filename    = `${filename}${extension}`
        this.pattern     = new RegExp (`^${this.filename}$`.replace (DATE_TOKEN, '(.*?)'))

        logStream.on ('rotate', () => this.check ())
        this.check ()

    }

    get current () {

        const date = moment ().format (this.datePattern)

        return this.filename.replace (DATE_TOKEN, date)

    }

    test (name) {

        return this.pattern.test (name) && name !== this.current

    }

}