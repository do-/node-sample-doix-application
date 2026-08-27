const  process  = require ('node:process'),     {ppid, pid} = process
const {Tracker} = require ('events-to-winston')

module.exports = class WorkerApplication extends require ('./Base') {

	initSignals (signalRouter) {

		signalRouter.close ()

	}

    initIPC () {

        process.on ('message', request => this.spawn (request))

    }

	get [Tracker.LOGGING_ID] () {

		return `${ppid}/${pid}`

	}

}