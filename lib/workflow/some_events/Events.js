module.exports = {

////////////////////////////////////////////////////////////////////////////////

getStatus:

    async function () {

        const {dbDw} = this

        return dbDw.getArray ('SELECT * FROM _v')

    },

}