const createError  = require ('http-errors')
const {WebService} = require ('doix-http')
const stringify    = require ('safe-stable-stringify')

module.exports = class Fallback extends WebService {

    constructor (app) {

        super (app, {
			name: 'http_fallback',
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'TRACE'],
            createError: () => createError (403)
        })

    }

    onJobInit (job) {

        const error = Error ('Rogue HTTP request')

        error.stack = error.message

        throw error

    }

    getJobLoggingDetails ({http: {request: {httpVersion, method, url, rawHeaders}}}) {

        return {httpVersion, method, url, rawHeaders}

    }

}