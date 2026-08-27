const  cluster       = require ('node:cluster')
const {JobSource} = require ('doix')

module.exports = class Default extends JobSource {

    constructor (app) {

        super (app, {name: 'ipc'})

		cluster.on ('message', (_, request) => this.spawn (request))

		app.workers = new (require ('../../WorkerProcessPool')) (app.conf.workers)

        app.workers.on ('error', e => this.emit ('error', e))

    }

	getJobLoggingDetails ({request}) {

		return request

	}

}