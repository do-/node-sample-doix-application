const createError  = require ('http-errors')
const {WebService} = require ('doix-http')
const stringify    = require ('safe-stable-stringify')

module.exports = class Dia extends WebService {

    constructor (app) {

        super (app, {
			name: 'dia',
            location: '/dia',
			methods: ['GET', 'POST'],
        })

    }

}