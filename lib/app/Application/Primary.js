const  process       = require ('node:process'), {pid} = process
const  cluster       = require ('node:cluster')
const {Tracker}      = require ('events-to-winston')

module.exports = class PrimaryApplication extends require ('./Base') {

	constructor (conf, logger) {

		super (conf, logger)

		this.workers = new (require ('../WorkerProcessPool')) (conf.workers)

        this.workers.on ('error', e => this.emit ('error', e))

		this.spawn ({type: 'primary_process', action: 'create'})

	}

	initSignals (signalRouter) {

		signalRouter.listen ()

	}

    initIPC () {

		cluster.on ('message', (_, request) => this.spawn (request))

    }
	
	get [Tracker.LOGGING_ID] () {

		return pid

	}

}