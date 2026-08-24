const  process       = require ('node:process'), {pid} = process
const  cluster       = require ('node:cluster')
const {Tracker}      = require ('events-to-winston')
const {Router}       = require ('protocol-agnostic-router')

module.exports = class PrimaryApplication extends require ('./Base') {

	constructor (conf, logger) {

		super (conf, logger)

		this.workers = new (require ('../WorkerProcessPool')) (conf.workers)

        this.workers.on ('error', err => this.logger.log ({level: 'warn', message: err.message, id: this [Tracker.LOGGING_ID]}))		

	}

	initSignals (signalRouter) {

		signalRouter.add ({[Router.PROCESS_MESSAGE]: (sig) => this.run ({type: 'primary_process', action: 'delete'})})

		signalRouter.listen ()

	}

	createJobSources () {

		super.createJobSources ()

		this.createQueue ('HeartBeat')
		
		if (this.conf.logs.dir) this.createQueue ('LogMoveQueue')

		;(this.someEventDoser = this.createObject ('MessageSources/Q/SomeEventDoser')).pipe (this.createQueue ('SomeEventQueue'))

	}

    initIPC () {

		cluster.on ('message', (_, request) => this.run (request))

    }
	
	get [Tracker.LOGGING_ID] () {

		return pid

	}

}