const conf   = require ('./lib/app/Conf')

const logger = require ('./lib/app/Logger') (conf)

const app    = new (require (`./lib/app/Application/${

    require ('node:cluster').isPrimary ? 'Primary' : 'Worker'

}`)) (conf, logger)