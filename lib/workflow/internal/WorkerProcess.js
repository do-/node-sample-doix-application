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

        setImmediate (() => this.app.run ({type: 'worker_process', action: 'delete'}))

        return

      }

    },

////////////////////////////////////////////////////////////////////////////////

doDelete:

    async function () {

      const {app} = this

      try {
        await app.httpRouter.close ()
      }
      catch (err) {
        this.emit ('info', err.message)
      }

      const KILL = () => cluster.worker.kill ()

      setImmediate (() => app.noJobsPending ().then (KILL, KILL))
      
    },

}