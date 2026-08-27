const {Queue} = require ('doix')

module.exports = class HeartBeat extends Queue {

    constructor (app) {

        super (app, {
            name: 'heartbeat',
            request: {
                type   : 'primary_process', 
                action : 'update'
            },
            interval: 60000,
        })

        this.check ()

    }

	getJobLoggingDetails () {

        return {}

    }

    async peek () {

        return {}

    }

	onJobNext () {

        // do nothing to block super.onJobNext
        
    }

}