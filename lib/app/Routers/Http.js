const {pid}         = require ('node:process')
const {HttpRouter}  = require ('protocol-agnostic-router')

const HANDLER_CLASS_NAMES = [
	'Dia',
	'Rest',
	'Fallback',
]

module.exports = class extends HttpRouter {

	constructor (app) {

		const {logger, conf: {http: {listen}}} = app

		super ({
			name: 'http_' + pid,
			listen,
			logger,
		})

		for (const name of HANDLER_CLASS_NAMES) this.add (app.createMessageSource ('HTTP/' + name))

	}

}