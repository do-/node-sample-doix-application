const cluster = require ('node:cluster')
const kind    = cluster.isPrimary ? 'Primary' : 'Worker'
const conf    = require ('./lib/app/Conf')
const logger  = require ('./lib/app/Logger') (conf)
const app     = new (require (`./lib/app/Application/${kind}`)) (conf, logger)

app.spawn ({
    type: kind.toLowerCase () + '_process',
    action: 'create',
})