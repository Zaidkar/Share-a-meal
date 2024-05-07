// Get the client
const mysql = require('mysql2')

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'share-a-meal'
})

// A simple SELECT query, without placeholders/prepared statements
connection.query(
    'SELECT name, description FROM `meal` WHERE `isActive` = 1',
    function (err, results, fields) {
        console.log(results) // results contains rows returned by server
        console.log(fields) // fields contains extra meta data about results, if available
    }
)

// Using placeholders, prepared statements
connection.query(
    'SELECT * FROM `user` WHERE `firstName` = ? AND `id` > ?',
    ['Herman', 1],
    function (err, results) {
        console.log(results)
    }
)

connection.end()
