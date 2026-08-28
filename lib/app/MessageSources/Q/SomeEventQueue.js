const {LinkedQueue}  = require ('doix')

module.exports = class SomeEventQueue extends LinkedQueue {

    constructor (app) {
        
        super (app, {
            name: 'ev',
            maxSize: 10000,
            request: {type: 'events', action: 'write'},
            doser: {
                maxSize: 1000,
                interval: 10000,
            }
        })

    }

}