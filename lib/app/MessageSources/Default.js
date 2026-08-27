const {JobSource} = require ('doix')

module.exports = class Default extends JobSource {

    constructor (app) {

        super (app, {name: 'def'})

    }

	getJobLoggingDetails ({request}) {

		return request.type === 'worker_process' ? null : request

	}    

    createJob (request = {}, options = {}) {

        const job = super.createJob (request, options)

        const {parent} = job; if (parent) {

            // inherit necessary things

        }

        return job

    }

}