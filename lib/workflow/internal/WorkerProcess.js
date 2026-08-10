const cluster = require ('node:cluster')

module.exports = {

////////////////////////////////////////////////////////////////////////////////

doUpdate:

    async function () {

      try {

        // Check for critical resources to be available

      }
      catch (err) {

        this.emit ('error', err)

        this.emit ('info', 'Due to the previous error, will terminate the process')

        setImmediate (() => this.app.exec ({type: 'worker_process', action: 'delete'}).then (_=>_,_=>_))

        return

      }

    },

////////////////////////////////////////////////////////////////////////////////

doDelete:

    async function () {

      const {app} = this

      for (let i = 0; i < 100; i ++) { // do our best to end all pending jobs gracefully

        const todo = []
        
        for (const src of app.jobSources.values ()) {

            for (const job of src.pending) if (job !== this) {

                todo.push (new Promise (ok => job.once ('finish', () => {
                  
                  job.emit ('next')
                  
                  ok ()
                
                })))

            }

        }

        if (todo.length === 0) break

        await Promise.all (todo)

      }

      try {
        await app.httpRouter.close ()
      }
      catch (err) {
        this.emit ('info', err.message)
      }

      // try {
      //   await db.pool.pool.end ()
      // }
      // catch (err) {
      //   this.emit ('info', err.message)
      // }

      cluster.worker.kill ()
      
    },

}