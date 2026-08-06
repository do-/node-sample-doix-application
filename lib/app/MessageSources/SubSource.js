const {JobSource} = require ('doix')

const NAME = 'def'

class SubSource extends JobSource {

    static NAME = NAME

    constructor (app) {

        super (app, {name: NAME})

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

module.exports = SubSource