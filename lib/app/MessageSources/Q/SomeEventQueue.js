const {LinkedQueue}  = require ('doix')
const SomeEventDoser = require ('./SomeEventDoser')

module.exports = class SomeEventQueue extends LinkedQueue {

    constructor (app) {
        
        super (app, {
            name: 'ev',
            maxSize: 10000,
            request: {type: 'events', action: 'write'},
        })

        this.doser = new SomeEventDoser (app)
        this.doser.pipe (this)

    }

}