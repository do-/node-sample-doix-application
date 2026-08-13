const process = require ('node:process')

const EXIT_SIGNALS = ['SIGTERM', 'SIGINT', 'SIGBREAK']

const NOP = () => {}

const block = () => {

    for (const signal of EXIT_SIGNALS) process.on (signal, NOP)

}

module.exports = {

    block,

    set: handler => {

        block ()

        for (const signal of EXIT_SIGNALS) process.once (signal, handler)

    },

}