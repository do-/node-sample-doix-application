const {Application} = require ('doix')

const Path          = require ('node:path')
const root          = Path.join (__dirname, '..', '..', 'workflow')

const jobClass      = require ('../Job.js')

module.exports = class extends Application {

	constructor (conf, logger) {

	    super ({

			jobClass,
	    	logger,

			modules: {
				dir: {root, filter: (_, arr) => arr.length === 2},
				watch: true,
			},

			pools: {
				dbDw: new (require ('../DbPools/DbDw')) (conf.dbDw),
			},

		})

		this.conf = conf

		for (const name of [
			'Default',
			'ExitSignals',
		]) this.createMessageSource (name)

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