const cluster       = require ('node:cluster')
const process       = require('node:process'), {ppid, pid} = process
const uniqid        = require ('uniqid')
const Path          = require ('node:path')
const {Tracker}     = require ('events-to-winston')
const {Application} = require ('doix')

const SubSource = require ('./SubSource')
const HeartBeat = require ('./HeartBeat')

const NOP = _ => _

async function subrequest (request, options = {}) {

	return this.app.exec (request, {...options, parent: this})

}

module.exports = class extends Application {

	constructor (conf, logger) {

		const globals = {conf}; globals.exec = subrequest

		const pools = {
			// db:    new DB (conf.db, logger),
		}

	    super ({
	    	
	    	logger,

			globals,

			generators: {
				id: () => uniqid.time (),
			},

			pools,

			modules: {
				dir: {root: Path.join (__dirname, '..', 'workflow')},
				watch: true,
			},

			handlers: {

				error : function (error) {

					if (typeof error === 'string') error = Error (error)
					
					while (error.cause) error = error.cause
					
					this.error = error

				},

			},

		})

		this.globals.get (Tracker.LOGGING_EVENTS).info = {level: 'info', message: s => s}

		new SubSource (this)

		this [cluster.isWorker ? 'initWorker' : 'initPrimary'] ()

	}

	get [Tracker.LOGGING_ID] () {

		return cluster.isWorker ? `${ppid}/${pid}` : pid

	}

	initPrimary () {

		{

			const {EventEmitter} = require ('events'), {workers} = this.globals.get ('conf')

			if (EventEmitter.defaultMaxListeners < workers) EventEmitter.defaultMaxListeners = workers

		}

		for (const transport of this.logger.transports) if ('logStream' in transport) {

			transport.logStream.on ('rotate', id => this.exec ({type: 'log', action: 'move', id}).then (NOP, NOP))

			break

		}

		new HeartBeat (this)

	}

	initWorker () {

		process.on ('message', request => this.exec (request).then (NOP, NOP))

	}

	async exec (request, options = {}) {

	 	return this.jobSources.get (SubSource.NAME).createJob (request, options).outcome ()

	}

}