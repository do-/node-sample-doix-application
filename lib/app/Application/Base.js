const Path          = require ('node:path')
const {Tracker}     = require ('events-to-winston')
const {Application} = require ('doix')
const SubSource     = require ('../MessageSources/SubSource')

module.exports = class extends Application {

	constructor (conf, logger) {

		const pools = {
			dbDw: new (require ('../DbPools/DbDw')) (conf.dbDw),
		}

	    super ({

			jobClass: require ('../Job.js'),
	    	
	    	logger,

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

		this.conf = conf
		logger.app = this

		this.globals.get (Tracker.LOGGING_EVENTS).info = {level: 'info', message: s => s}

		this.createJobSources ()

		this.signalRouter = this.createRouter ('Signals')
		this.initSignals (this.signalRouter) 

		this.initIPC ()

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

}