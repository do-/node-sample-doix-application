const process     = require ('node:process')
const {JobSource} = require ('doix')

const SIGNALS = ['SIGTERM', 'SIGINT', 'SIGBREAK']

const NOP = () => {}

module.exports = class ExitSignals extends JobSource {

    constructor (app) {

        super (app, {
            name: 'sig',
            request: {
                type   : 'primary_process',
                action : 'delete',
            },
        })

        app.initSignals (this)

    }

    close () {

		for (const signal of SIGNALS) {

			process.removeAllListeners (signal)

			process.on (signal, NOP)

		}

        return this

    }

    listen () {

        const handler = id => this.close ().spawn ({id})

		for (const signal of SIGNALS)
            
            process.once (signal, handler)

    }

	getJobLoggingDetails ({request}) {

		return request

	}

}