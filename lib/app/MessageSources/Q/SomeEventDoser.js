const {Doser} = require ('doix')

module.exports = class SomeEventDoser extends Doser {

    constructor (app) {

        super (app, {
            name: 'someEventDoser',
            maxSize: 1000,
            interval: 10000,
        })

    }

}