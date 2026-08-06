const process     = require ('node:process')
const cluster     = require ('node:cluster')
const conf        = require ('./lib/app/Conf')
const logger      = require ('./lib/app/Logger.js') (conf)
const app         = new (require ('./lib/app/Application.js')) (conf, logger)

const SIGS = ['SIGTERM', 'SIGINT', 'SIGBREAK']

function blockSignals () {

    for (const signal of SIGS) process.on (signal, _ => {})

}

async function exit () {

    blockSignals ()

    try {

        if (app) await app.exec ({type: 'primary_process', action: 'delete'})

        logger.on ('finish', () => setTimeout (() => process.exit (0), 10)) 

        logger.end ()

    }
    catch (err)  {

        console.log (err)

        process.exit (1)

    }

}

if (cluster.isPrimary) {

    for (const signal of SIGS) process.once (signal, exit)

}
else {

   blockSignals ()

}