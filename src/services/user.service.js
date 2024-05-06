const database = require('../dao/inmem-db')

const userService = {
    create: (user, callback) => {
        database.add(user, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `User created with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    getAll: (callback) => {
        database.getAll((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                console.log(data)
                callback(null, {
                    message: `Found ${data.length} users.`,
                    data: data
                })
            }
        })
    },

    update(userId, userUpdated, callback) {
        database.update(userId, userUpdated, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `User with ${userId} updated`,
                    data: data
                })
            }
        })
    },

    delete: (userId, callback) => {
        database.delete(userId, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `User with ${userId} deleted.`,
                    data: data
                })
            }
        })
    },

    getById: (userId, callback) => {
        database.getById(userId, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `User with id ${userId} found.`,
                    data: data
                })
            }
        })
    }
}

module.exports = userService
