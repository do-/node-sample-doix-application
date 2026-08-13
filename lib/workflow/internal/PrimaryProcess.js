const {Tracker} = require ('events-to-winston')

module.exports = {

////////////////////////////////////////////////////////////////////////////////

doCreate:

    async function () {

        // Invoked once, on the 1st HeartBeat

        // Here, all resources are ready but no worker is spawn yet

        const {app} = this, todo = []

        for (const dbPool of app.dbPools ()) todo.push (dbPool.updateModel (this))

        await Promise.all (todo)

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

}