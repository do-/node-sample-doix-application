const process       = require ('node:process')
const uniqid        = require ('uniqid')
const Path          = require ('node:path')

const {Tracker}     = require ('events-to-winston')
const {Application} = require ('doix')
const {DbPool}      = require ('doix-db')

const SubSource     = require ('../MessageSources/SubSource')

// Job's additional methods to be injected via `globals`

async function subrequest (request, options = {}) {

	return this.app.exec (request, {...options, parent: this})

}

async function noJobsLeft (maxIterations = 100) {

	for (let i = 0; i < maxIterations; i ++) { // do our best to end all pending jobs gracefully

		const todo = []
		
		for (const src of this.app.jobSources.values ()) {

			for (const job of src.pending) {

				if (job === this) continue

				todo.push (new Promise (ok => job.once ('finish', () => {
				
					job.emit ('next')
					
					ok ()
				
				})))
			}
		}

		if (todo.length === 0) break

		await Promise.all (todo)

	}

}

// The main application class

module.exports = class extends Application {

	constructor (conf, logger) {

		const globals = {conf}
		
		globals.exec = subrequest
		globals.isTheLastJobInProgress = noJobsLeft
		globals.send = request => process.send (request)

		const pools = {
			dbDw: new (require ('../DbPools/DbDw')) (conf.dbDw),
		}

	    super ({
	    	
	    	logger,

			globals,

			generators: {
				id: () => uniqid.time (),
			},

			pools,

			modules: {
				dir: {
					root: Path.join (__dirname, '..', '..', 'workflow'),
					filter: (_, arr) => arr.length === 2
				},
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

		logger.app = this

		this.globals.get (Tracker.LOGGING_EVENTS).info = {level: 'info', message: s => s}

		this.createJobSources ()

		this.signalRouter = this.createRouter ('Signals')
		this.initSignals (this.signalRouter) 

		this.initIPC ()

	}

	onExitSignal () {

		// By default, do nothing

	}

	createJobSources () {

		new SubSource (this)

	}
	
	async exec (request, options = {}) {

	 	return this.jobSources.get (SubSource.NAME).createJob (request, options).outcome ()

	}

	run (request, options) {

		const NOP = () => {}

		this.exec (request, options).then (NOP, NOP)

	}

	get conf () {

		return this.globals.get ('conf')

	}

	createObject (localPath) {

		return new (require ('../' + localPath)) (this)

	}

	createMessageSource (className) {

		return this.createObject ('MessageSources/' + className)

	}

	createRouter (name) {

		return this.createObject ('Routers/' + name)

	}

	createQueue (className) {

		return this.createMessageSource ('Q/' + className)

	}

	* dbPools () {

		for (const pool of this.pools.values ()) 

			if (pool instanceof DbPool)
			
				yield pool

	}

}