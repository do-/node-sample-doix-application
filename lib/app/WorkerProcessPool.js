const  process       = require ('node:process'), {pid} = process
const  cluster       = require ('node:cluster')
const {EventEmitter} = require ('events')

module.exports = class extends EventEmitter {

	constructor (n) {

		if (EventEmitter.defaultMaxListeners < n) EventEmitter.defaultMaxListeners = n

		super ()

		this.n = n

	}
	
	* live () {

		const {workers} = cluster; for (const id in workers) {

			const worker = workers [id]

			if (!worker.isDead ())

				yield worker

		}

	}

	async add (options) {

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

	async launchAsNecessary () {

        let toSpawn = this.n; for (const worker of this.live ()) toSpawn --

		if (toSpawn === 0) return

        const toDo = []; for (let i = 0; i < toSpawn; i ++) toDo.push (this.add ({}))

        await Promise.all (toDo)

	}

	async endAll () {

        const todo  = []; for (const worker of this.live ()) {

            const onSend = err => {

                if (!err) return

				this.emit ('error', `Failed to invoke workerProcess.doDelete for PID ${worker.process.pid}: ${err.message}`)

                // this.logger.log ({level: 'warn', message: `Failed to invoke workerProcess.doDelete for PID ${worker.process.pid}: ${err.message}`, id: this [Tracker.LOGGING_ID]})

                worker.kill ()

            }

            todo.push (new Promise (ok => {

                worker.on ('exit', ok)
                
                worker.send ({type: 'worker_process', action: 'delete'}, onSend)

            }))

        }

        await Promise.all (todo)

	}



}