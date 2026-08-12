module.exports = {

////////////////////////////////////////////////////////////////////////////////

getStatus:

    async function () {

        const {dbDw} = this

        return dbDw.getArray ('SELECT * FROM _v')

    },

////////////////////////////////////////////////////////////////////////////////

doCreate:

    async function () {

        const {dbDw, request: {code, value}} = this

        const d = new Date (); d.setHours (d.getHours () + 3)

        this.send ({
            type:   'events', 
            action: 'store', 
            data: {
                code,
                value,
                ts: d.toJSON ().slice (0, -1)
            }
        })

        return {}

    },

////////////////////////////////////////////////////////////////////////////////

doStore:

    async function () {

        const {app, request: {data}} = this

        app.jobSources.get ('ev').add ({data})

    },

////////////////////////////////////////////////////////////////////////////////

doWrite:

    async function () {

        const {dbDw, request: {data}} = this

        await dbDw.insert ('some_events', data)

    },

}