const  process       = require ('node:process'), {pid} = process
const  cluster       = require ('node:cluster')
const {Tracker}      = require ('events-to-winston')

module.exports = class PrimaryApplication extends require ('./Base') {

	initSignals (signalRouter) {

		signalRouter.listen ()

	}

    initIPC () {

		cluster.on ('message', (_, request) => this.spawn (request))

		this.workers = new (require ('../WorkerProcessPool')) (this.conf.workers)

        this.workers.on ('error', e => this.emit ('error', e))

    }
	
	get [Tracker.LOGGING_ID] () {

		return pid

	}

}