const  process  = require ('node:process'),     {ppid, pid} = process
const {Tracker} = require ('events-to-winston')

module.exports = class WorkerApplication extends require ('./Base') {

	constructor (conf, logger) {

		super (conf, logger)

		this.httpRouter = this.createRouter ('Http')
		this.httpRouter.listen ()

	}

	initSignals (signalRouter) {
		
		signalRouter.close ()

	}

    initIPC () {

        process.on ('message', request => this.run (request))

    }

	get [Tracker.LOGGING_ID] () {

		return `${ppid}/${pid}`

	}

}