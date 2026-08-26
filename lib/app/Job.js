const process = require ('node:process')
const uniqid  = require ('uniqid')
const {Job}   = require ('doix')

module.exports = class extends Job {

	constructor (request, options = {}) {

		super (request, options)

		this.id = uniqid.time ()

	}

	get conf () {

		return this.app.conf

	}

	async exec (request, options = {}) {

		return this.app.exec (request, {...options, parent: this})

	}

	send (request) {

		process.send (request)

	}

}