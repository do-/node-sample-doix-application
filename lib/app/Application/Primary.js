const  process       = require ('node:process'), {pid} = process
const {Tracker}      = require ('events-to-winston')

module.exports = class PrimaryApplication extends require ('./Base') {

	initSignals (signalRouter) {

		signalRouter.listen ()

	}
	
	get [Tracker.LOGGING_ID] () {

		return pid

	}

}