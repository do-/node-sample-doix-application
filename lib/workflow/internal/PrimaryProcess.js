const cluster   = require ('node:cluster')
const os        = require ('node:os')
const {Tracker} = require ('events-to-winston')

async function newWorker (options) {

    return new Promise (((ok, fail) => {

        cluster.once ('error', fail)

        cluster.once ('online', worker => {

            cluster.off ('error', fail)

            // worker. ... = options. ...

            ok (worker)
        
        })

        cluster.fork ()

    }))
    
}

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

        const {app, conf} = this

        // Invoked on 2nd and all later HeartBeats

        let toSpawn = conf.workers; for (const worker of app.liveWorkers ()) toSpawn --
            
        const toDo = []; for (let i = 0; i < toSpawn; i ++) toDo.push (newWorker ({}))

        await Promise.all (toDo)

        for (const worker of app.liveWorkers ())
            
            worker.send ({type: 'worker_process', action: 'update'})

    },

////////////////////////////////////////////////////////////////////////////////

doDelete:

    async function () {

        const todo  = []; for (const worker of Object.values (cluster.workers)) if (!worker.isDead ()) {

            const onSend = err => {

                if (!err) return

                this.logger.log ({level: 'warn', message: `Failed to invoke workerProcess.doDelete for PID ${worker.process.pid}: ${err.message}` , id: this [Tracker.LOGGING_ID]})

                worker.kill ()

            }

            todo.push (new Promise (ok => {

                worker.on ('exit', ok)
                
                worker.send ({type: 'worker_process', action: 'delete'}, onSend)

            }))

        }

        await Promise.all (todo)

    },

}