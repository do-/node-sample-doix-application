const  process  = require ('node:process'),     {ppid, pid} = process
const {Tracker} = require ('events-to-winston')

module.exports = class WorkerApplication extends require ('./Base') {

	initSignals (signalRouter) {

		signalRouter.close ()

	}

	get [Tracker.LOGGING_ID] () {

		return `${ppid}/${pid}`

	}

}