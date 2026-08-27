const cluster = require ('node:cluster')

module.exports = {

////////////////////////////////////////////////////////////////////////////////

doCreate:

    async function () {

      const {app} = this

  		app.httpRouter = app.createRouter ('Http')

      app.httpRouter.listen ()

    },

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

      await this.ensureLastJob ()

      cluster.worker.kill ()
      
    },

}