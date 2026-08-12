const EXIT_SIGNALS = ['SIGTERM', 'SIGINT', 'SIGBREAK']

const process        = require ('node:process')
const cluster        = require ('node:cluster')

const conf           = require ('./lib/app/Conf')
const logger         = require ('./lib/app/Logger.js') (conf)
const app            = new (require ('./lib/app/Application.js')) (conf, logger)

function blockSignals () {

    for (const signal of EXIT_SIGNALS) process.on (signal, _ => {})

}

async function exit () {

    blockSignals ()

    try {

        await app.exec ({type: 'primary_process', action: 'delete'})

        logger.on ('finish', () => setTimeout (() => process.exit (0), 10)) 

        logger.end ()

    }
    catch (err)  {

        console.log (err)

        process.exit (1)

    }

}

function setSignals () {

    for (const exitSignal of EXIT_SIGNALS) process.once (exitSignal, exit)

}

function checkDefaultMaxListeners () {

    const {workers} = conf, {EventEmitter} = require ('events')
    
    if (EventEmitter.defaultMaxListeners < workers) EventEmitter.defaultMaxListeners = workers

}

function setLogRotate () {

    for (const {logStream} of logger.transports)
        
        if (logStream != null)
            
            logStream.on ('rotate', id => app.run ({type: 'log', action: 'move', id}))

}

if (cluster.isPrimary) {

    setSignals ()    

    checkDefaultMaxListeners ()

    setLogRotate ()

}
else {

    blockSignals ()

	process.on ('message', request => app.run (request))

    app.run ({type: 'worker_process', action: 'create'})

}