const  process       = require ('node:process'), {pid} = process
const  cluster       = require ('node:cluster')
const {EventEmitter} = require ('events')
const {Tracker}      = require ('events-to-winston')

const EMPTY_LIST = []
const NOP = () => {}

module.exports = class PrimaryApplication extends require ('./Base') {

	constructor (conf, logger) {

		super (conf, logger)

	    this.exitSignals.set (sig => this.close (sig).then (NOP, NOP))

		this.workers = new (require ('../WorkerProcessPool')) (conf.workers)

        this.workers.on ('error', err => this.logger.log ({level: 'warn', message: err.message, id: this [Tracker.LOGGING_ID]}))

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

	async close (sig) {

		try {

			this.logger.log ({level: 'info', id: this [Tracker.LOGGING_ID], message: sig})

			// first, stopping child processes

			await this.workers.endAll ()

			// then, flushing local sources

			this.someEventDoser.stop ()

			// finally, waiting for running jobs to finish

			await this.noJobsPending ()

			// one last log line

			this.logger.on ('finish', () => setTimeout (() => process.exit (0), 10))

			this.logger.log ({level: 'info', id: this [Tracker.LOGGING_ID], message: 'exiting'})

			this.logger.end ()

		}
		catch (err)  {

			console.log (err)

			process.exit (1)

		}

	}

}