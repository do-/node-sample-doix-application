const  process  = require ('node:process'),     {ppid, pid} = process
const {Tracker} = require ('events-to-winston')

module.exports = class WorkerApplication extends require ('./Base') {

	constructor (conf, logger) {

		super (conf, logger)

        this.exitSignals.block ()

		;(this.httpRouter = this.createObject ('HttpRouter')).listen ()

	}

    initIPC () {

        process.on ('message', request => this.run (request))

    }

	get [Tracker.LOGGING_ID] () {

		return `${ppid}/${pid}`

	}

}