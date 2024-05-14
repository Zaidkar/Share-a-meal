require('dotenv').config()

// Set the logging level.
const loglevel = process.env.LOGLEVEL

const logger = require('tracer').colorConsole({
    format: ['{{timestamp}} <{{title}}> {{file}}:{{line}} : {{message}}'],
    preprocess: function (data) {
        data.title = data.title.toUpperCase()
    },
    dateformat: 'isoUtcDateTime',
    level: loglevel
})

module.exports = logger
