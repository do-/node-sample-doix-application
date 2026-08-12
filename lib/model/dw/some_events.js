module.exports = {

    comment: 'Some events',

    columns: {
        ts      : 'DateTime64(3) // timestamp',
        code    : `String!       // variable name`,
        value   : 'Float32!      // variable value',
    },

    pk: 'ts',

    partitionBy: 'toYYYYMM(ts)',

}