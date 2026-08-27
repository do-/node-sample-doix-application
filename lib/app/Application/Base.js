const {Tracker}     = require ('events-to-winston')
const {Application} = require ('doix')

const Path          = require ('node:path')
const root          = Path.join (__dirname, '..', '..', 'workflow')

module.exports = class extends Application {

	constructor (conf, logger) {

	    super ({

			jobClass: require ('../Job.js'),
	    	
	    	logger,

			pools: {
				dbDw: new (require ('../DbPools/DbDw')) (conf.dbDw),
			},

			modules: {
				dir: {root, filter: (_, arr) => arr.length === 2},
				watch: true,
			},

		})

		this.conf = conf

		this.globals.get (Tracker.LOGGING_EVENTS).info = {level: 'info', message: s => s}

		for (const name of [
			'Default',
			'ExitSignals',
		]) this.createMessageSource (name)

		this.initIPC ()

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