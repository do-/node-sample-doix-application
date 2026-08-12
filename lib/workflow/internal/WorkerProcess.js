const cluster = require ('node:cluster')

module.exports = {

////////////////////////////////////////////////////////////////////////////////

doCreate:

    async function () {

      const {app} = this

			app.httpRouter = app.createObject ('HttpRouter')

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

        setImmediate (() => this.app.exec ({type: 'worker_process', action: 'delete'}).then (_=>_,_=>_))

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

      await this.noJobsPending ()

      // for (const dbPool of app.dbPools ()) try {
      //   await dbPool.end ()
      // }
      // catch (err) {
      //   this.emit ('info', err.message)
      // }

      cluster.worker.kill ()
      
    },

}