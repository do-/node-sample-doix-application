const process   = require ('node:process')

const {Router}  = require ('protocol-agnostic-router')
const {Tracker} = require ('events-to-winston')

const SIGNALS = ['SIGTERM', 'SIGINT', 'SIGBREAK']

const NOP = () => {}

module.exports = class SignalRouter extends Router {

	constructor (app) {

        const {logger} = app
        
		super ({name: 'sig', logger})

		this.add ({[Router.PROCESS_MESSAGE]: _ => app.onExitSignal (_)})

    }

    listen () {

        super.listen ()

        for (const signal of SIGNALS) process.once (signal, _ => this.process (_))

    }

    close () {

        for (const signal of SIGNALS) process.on (signal, _ => NOP)

        super.close ()

    }

    get [Tracker.LOGGING_PARENT] () {

        return this.logger.app

    }

	get [Tracker.LOGGING_EVENTS] () {

		return {

			start: {
				level: 'info',
				details: {},
			},

			data: {
				level: 'info',
				details: o => o,
			},

			finish: {
				level: 'info',
			},

		}

	}    

}