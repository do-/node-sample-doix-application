const {Queue} = require ('doix')

const ACT_ONCE = 'create'
const ACT_THEN = 'update'

module.exports = class HeartBeat extends Queue {

    constructor (app) {

        const options = {
            interval: 60000,
            request: {type: 'primary_process', action: ACT_ONCE},
            name: 'reboot',
        }
        
        super (app, options)

        this.check ()

    }

	getJobLoggingDetails () {

        return {}

    }

    async peek () {

        return {}

    }

	onJobNext () {

        const {request} = this; if (request.action === ACT_ONCE) {

            request.action = ACT_THEN

            return super.onJobNext ()

        }

	}

}