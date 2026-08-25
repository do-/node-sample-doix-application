const {Tracker}      = require ('events-to-winston')
const {SignalRouter} = require ('protocol-agnostic-router')

module.exports = class extends SignalRouter {

	constructor (app) {

        const {logger} = app

		super ({
			logger,
			name: 'sig', 
			handler: {
				signals : ['SIGTERM', 'SIGINT', 'SIGBREAK'],
				handler : _ => app.run ({type: 'primary_process', action: 'delete'}),
				once    : true
			}
		})

    }

	get [Tracker.LOGGING_PARENT] () {

        return this.logger.app

    }

}