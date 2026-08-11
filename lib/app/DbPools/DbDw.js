const {DbPoolCh} = require ('doix-db-clickhouse')

module.exports = class DbDw extends DbPoolCh {

    constructor ({url, database}) {

        super ({url, database, 
            // options: {timeout: 1000},
            // agent: {maxSockets: 10},
            // logger: ConsoleLogger.DEFAULT,
            // eventLoggerClass: require ('MySpecialDbLogger'),
        })

    }

}