const cluster       = require ('node:cluster')
const process       = require ('node:process'), {ppid, pid} = process
const uniqid        = require ('uniqid')
const Path          = require ('node:path')

const {Tracker}     = require ('events-to-winston')
const {Application} = require ('doix')
const {DbPool}      = require ('doix-db')

const SubSource     = require ('./MessageSources/SubSource')

const PRIMARY_Q_NAMES = [
	'HeartBeat',
	'SomeEventQueue',
]

async function subrequest (request, options = {}) {

	return this.app.exec (request, {...options, parent: this})

}

async function noJobsPending (maxIterations = 100) {

  for (let i = 0; i < maxIterations; i ++) { // do our best to end all pending jobs gracefully

    const todo = []
    
    for (const src of this.app.jobSources.values ()) {

        for (const job of src.pending) if (job !== this) {

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


module.exports = class extends Application {

	constructor (conf, logger) {

		const globals = {conf}
		
		globals.exec = subrequest
		globals.noJobsPending = noJobsPending
		
		if (cluster.isWorker) globals.send = request => process.send (request)

		const pools = {
			dbDw: new (require ('./DbPools/DbDw')) (conf.dbDw),
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
					root: Path.join (__dirname, '..', 'workflow'),
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

		this.globals.get (Tracker.LOGGING_EVENTS).info = {level: 'info', message: s => s}

		new SubSource (this)

		if (cluster.isPrimary)
			for (const name of PRIMARY_Q_NAMES)
				this.createQueue (name)

		this.someEventDoser = this.createObject ('MessageSources/Q/SomeEventDoser')

	}
	
	async exec (request, options = {}) {

	 	return this.jobSources.get (SubSource.NAME).createJob (request, options).outcome ()

	}

	run (request, options) {

		const NOP = () => {}

		this.exec (request, options).then (NOP, NOP)

	}

	get [Tracker.LOGGING_ID] () {

		return cluster.isWorker ? `${ppid}/${pid}` : pid

	}

	get conf () {

		return this.globals.get ('conf')

	}

	createObject (localPath) {

		return new (require ('./' + localPath)) (this)

	}

	createMessageSource (className) {

		return this.createObject ('MessageSources/' + className)

	}

	createQueue (className) {

		return this.createMessageSource ('Q/' + className)

	}

	* dbPools () {

		for (const pool of this.pools.values ()) 

			if (pool instanceof DbPool)
			
				yield pool

	}

	* liveWorkers () {

		const {workers} = cluster; for (const id in workers) {

			const worker = workers [id]

			if (!worker.isDead ())
				
				yield worker

		}

	}

}