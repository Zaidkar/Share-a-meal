const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'INSERT INTO `user` (firstName, lastName, emailAdress, password, street, city, isActive, phoneNumber, roles ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    user.firstName,
                    user.lastName,
                    user.emailAdress,
                    user.password,
                    user.street,
                    user.city,
                    1,
                    user.phoneNumber,
                    'guest,editor'
                ],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        if (error.code === 'ER_DUP_ENTRY') {
                            logger.error(error)
                            const duplicateError = new Error(
                                'User with email already exists'
                            )
                            duplicateError.status = 403
                            callback(duplicateError, null)
                        } else {
                            logger.error(error)
                            callback(error, null)
                        }
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `User with id ${results.insertId} created.`,
                            data: results
                        })
                    }
                }
            )
        })
    },
    update: (userId, updatedUser, callback) => {
        logger.info('update userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'UPDATE `user` SET firstName=?, lastName=?, emailAdress=?, password=?, street=?, city=?, phoneNumber=?, isActive=? WHERE id=?',
                [
                    updatedUser.firstName,
                    updatedUser.lastName,
                    updatedUser.emailAdress,
                    updatedUser.password,
                    updatedUser.street,
                    updatedUser.city,
                    updatedUser.phoneNumber,
                    updatedUser.isActive,
                    userId
                ],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        if (results.affectedRows === 0) {
                            const notFoundError = new Error(
                                `User with id ${userId} not found.`
                            )
                            notFoundError.status = 404
                            callback(notFoundError, null)
                        } else {
                            callback(null, {
                                message: `User with id ${userId} updated successfully.`,
                                data: updatedUser
                            })
                        }
                    }
                }
            )
        })
    },

    delete: (userId, callback) => {
        logger.info('to delete userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'DELETE FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.affectedRows === 0) {
                            const Error404 = new Error()
                            Error404.message = `User with id ${userId} could not be found.`
                            Error404.status = 404
                            logger.error(Error404)
                            callback(Error404, null)
                        } else {
                            logger.debug(results)
                            callback(null, {
                                message: `User with id ${userId} deleted successfully.`,
                                data: results
                            })
                        }
                    }
                }
            )
        })
    },

    getAll: (callback) => {
        logger.info('getAll')
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `user`',
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} users.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getById: (userId, callback) => {
        logger.info('getById userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName, emailAdress FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.length === 0) {
                            const noUserError = new Error(
                                `User with id ${userId} not found.`
                            )
                            logger.error(noUserError)
                            callback(noUserError, null)
                        } else {
                            logger.debug(results)
                            callback(null, {
                                message: `Found user with id: ${userId}.`,
                                data: results
                            })
                        }
                    }
                }
            )
        })
    },

    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} user.`,
                            data: results
                        })
                    }
                }
            )
        })
    }
}

module.exports = userService
