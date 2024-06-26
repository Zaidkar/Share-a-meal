const mysql = require('mysql2')
const logger = require('../util/logger')
require('dotenv').config()

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    connectionLimit: 10,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
}

logger.trace(dbConfig)

const pool = mysql.createPool(dbConfig)

pool.on('connection', function (connection) {
    logger.trace(
        `Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`
    )
})

pool.on('acquire', function (connection) {
    logger.trace('Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
    logger.trace('Connection %d released', connection.threadId)
})

const getConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
            }
            resolve(connection)
        })
    })
}

const query = async (query) => {
    const connection = await getConnection()
    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows, fields) => {
            connection.release()
            if (err) {
                reject(err)
            }
            resolve(rows)
        })
    })
}

module.exports = pool
