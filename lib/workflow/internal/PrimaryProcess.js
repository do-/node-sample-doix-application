const {DbPool}      = require ('doix-db')

module.exports = {

////////////////////////////////////////////////////////////////////////////////

doCreate:

    async function () {

        const {app, conf} = this

        // Invoked once, on the 1st HeartBeat

        // Here, all resources are ready but no worker is spawn yet

        await Promise.all ([...this.resources (DbPool)].map (db => db.pool.updateModel (this)))

		if (conf.logs.dir) app.createQueue ('LogMoveQueue')

		app.createQueue ('HeartBeat')

        app.someEventDoser = app.createObject ('MessageSources/Q/SomeEventDoser')

    },

////////////////////////////////////////////////////////////////////////////////

doUpdate:

    async function () {

        const {app: {workers}, conf} = this

        // Invoked on 2nd and all later HeartBeats

        await workers.launchAsNecessary ()

        for (const worker of workers.live ())
            
            worker.send ({type: 'worker_process', action: 'update'})

    },

////////////////////////////////////////////////////////////////////////////////

doDelete:

    async function () {

        const {app} = this

		try {

			app.signalRouter.close ()
			
			// first, stopping child processes

			await app.workers.endAll ()

			// then, flushing local sources

			app.someEventDoser.stop ()

			// finally, waiting for running jobs to finish

			await this.ensureLastJob ()

			// by closing logger, we are invoking the normal process exit

            setImmediate (() => app.logger.end ())

		}
		catch (err)  {

			console.log (err)

			process.exit (1)

		}

    },

}