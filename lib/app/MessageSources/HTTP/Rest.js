const createError  = require ('http-errors')
const {WebService} = require ('doix-http')
const stringify    = require ('safe-stable-stringify')

const METHODS_TO_ACTIONS = {
    GET:    undefined,
    POST:   'update', 
    PUT:    'create',
    DELETE: 'delete',
}

module.exports = class Dia extends WebService {

    constructor (app) {

        super (app, {
			name: 'rest',
            location: '/rest',
			methods: Object.keys (METHODS_TO_ACTIONS),
            pathMapping: ([type, id]) => ({type, id}),
        })

    }

    getRequest (http) {

        const request = super.getRequest (http)

        request.action = METHODS_TO_ACTIONS [http.request.method]

        return request

    }

}