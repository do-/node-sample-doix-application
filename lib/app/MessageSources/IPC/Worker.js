const  process    = require ('node:process')
const {JobSource} = require ('doix')

module.exports = class Default extends JobSource {

    constructor (app) {

        super (app, {name: 'ipc'})

        process.on ('message', request => this.spawn (request))

    }

	getJobLoggingDetails ({request}) {

		return request

	}

}