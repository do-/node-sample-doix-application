const Path       = require ('node:path')
const {DbModel}  = require ('doix-db')
const {DbPoolCh} = require ('doix-db-clickhouse')

const src = Path.join (__dirname, '..', '..', 'model', 'dw')

module.exports = class DbDw extends DbPoolCh {

    constructor ({url, database}) {

        super ({url, database, 
            // options: {timeout: 1000},
            // agent: {maxSockets: 10},
            // logger: ConsoleLogger.DEFAULT,
            // eventLoggerClass: require ('MySpecialDbLogger'),
        })

        new DbModel ({db: this, src})

        this.model.loadModules ()

    }

    async updateModel (job) {

        const {name} = this

		await this.setResource (job, name)

        const db = job [name], plan = db.createMigrationPlan ()

        await plan.loadStructure ()

        plan.inspectStructure ()

        await db.doAll (plan.genDDL ())

    }

}