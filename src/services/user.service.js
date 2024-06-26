const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const userService = {
    create: (newUser, callback) => {
        logger.info('create', newUser)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            } else {
                connection.query(
                    'SELECT COUNT(*) AS count FROM `user` WHERE `emailAdress` = ?',
                    [newUser.emailAdress],
                    function (error, results) {
                        if (error) {
                            connection.release()
                            logger.error(error)
                            callback(error, null)
                        } else {
                            const emailCount = results[0].count

                            if (emailCount > 0) {
                                connection.release()
                                callback(
                                    {
                                        status: 403,
                                        message: 'Email address already exists',
                                        data: {}
                                    },
                                    null
                                )
                            } else {
                                let newUserId = null
                                connection.query(
                                    'INSERT INTO `user` (`firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                    [
                                        newUser.firstName,
                                        newUser.lastName,
                                        newUser.isActive ? 1 : 0 || 1,
                                        newUser.emailAdress,
                                        newUser.password,
                                        newUser.phoneNumber,
                                        newUser.roles &&
                                        newUser.roles.length > 0
                                            ? newUser.roles.join(',')
                                            : '',
                                        newUser.street || null,
                                        newUser.city || null
                                    ],
                                    function (error, insertResults) {
                                        if (error) {
                                            connection.release()
                                            logger.error(error)
                                            callback(error, null)
                                        } else {
                                            newUserId = insertResults.insertId

                                            connection.query(
                                                'SELECT * FROM `user` WHERE `id` = ?',
                                                [newUserId],
                                                function (error, userResults) {
                                                    connection.release()

                                                    if (error) {
                                                        logger.error(error)
                                                        callback(error, null)
                                                    } else {
                                                        if (
                                                            userResults.length >
                                                            0
                                                        ) {
                                                            userResults[0].roles =
                                                                userResults[0].roles.split(
                                                                    ','
                                                                )
                                                        }
                                                        logger.debug(
                                                            'Newly created user:',
                                                            userResults
                                                        )
                                                        callback(null, {
                                                            message: `User created with id ${newUserId}.`,
                                                            data: userResults,
                                                            status: 201
                                                        })
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        }
                    }
                )
            }
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
                            status: 200,
                            message: `Found ${results.length} users.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getById: (id, callback) => {
        logger.info('getById', id)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            let userData = null

            connection.query(
                `SELECT id, firstName, lastName, isActive, emailAdress, phoneNumber, roles, street, city FROM \`user\` WHERE \`id\` = ?`,
                [id],
                function (error, userResults, fields) {
                    if (error) {
                        connection.release()
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(userResults)
                        if (userResults.length === 0) {
                            connection.release()
                            callback(
                                {
                                    status: 404,
                                    message: `Error: id ${id} does not exist!`
                                },
                                null
                            )
                            return
                        }

                        userData = userResults[0]

                        connection.query(
                            `SELECT * FROM meal WHERE cookId = ?`,
                            [id],
                            function (mealError, mealResults, fields) {
                                connection.release()

                                if (mealError) {
                                    logger.error(mealError)
                                    callback(mealError, null)
                                } else {
                                    logger.debug(mealResults)

                                    callback(null, {
                                        message: `Found user with id ${id}.`,
                                        data: {
                                            user: userData,
                                            meals: mealResults
                                        },
                                        status: 200
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
    },

    getByIdName: (id, callback) => {
        logger.info('getById', id)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            let userData = null

            connection.query(
                `SELECT id, firstName, lastName FROM \`user\` WHERE \`id\` = ?`,
                [id],
                function (error, userResults, fields) {
                    if (error) {
                        connection.release()
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(userResults)
                        if (userResults.length === 0) {
                            connection.release()
                            callback(
                                {
                                    status: 404,
                                    message: `Error: id ${id} does not exist!`
                                },
                                null
                            )
                            return
                        }

                        userData = userResults[0]

                        connection.query(
                            `SELECT * FROM meal WHERE cookId = ?`,
                            [id],
                            function (mealError, mealResults, fields) {
                                connection.release()

                                if (mealError) {
                                    logger.error(mealError)
                                    callback(mealError, null)
                                } else {
                                    logger.debug(mealResults)

                                    callback(null, {
                                        message: `Found user with id ${id}.`,
                                        data: {
                                            user: userData,
                                            meals: mealResults
                                        },
                                        status: 200
                                    })
                                }
                            }
                        )
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
                            status: 200,
                            message: `Found ${results.length} user.`,
                            data: results[0]
                        })
                    }
                }
            )
        })
    },

    update: (id, updatedUser, callback) => {
        logger.info('update', id, updatedUser)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `user` WHERE `id` = ?',
                [id],
                function (error, results, fields) {
                    if (error) {
                        logger.error(error)
                        callback(error, null)
                        return
                    }

                    if (results.length === 0) {
                        callback(
                            {
                                status: 404,
                                message: `Error: id ${id} does not exist!`
                            },
                            null
                        )
                        return
                    }

                    const updatedRoles =
                        updatedUser.roles && updatedUser.roles.length > 0
                            ? updatedUser.roles.join(',')
                            : ''

                    connection.query(
                        'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `emailAdress` = ?, `password` = ?, `isActive` = ?, `street` = ?, `city` = ?, `phoneNumber` = ?, `roles` = ? WHERE `id` = ?',
                        [
                            updatedUser.firstName,
                            updatedUser.lastName,
                            updatedUser.emailAdress,
                            updatedUser.password,
                            updatedUser.isActive || null,
                            updatedUser.street || null,
                            updatedUser.city || null,
                            updatedUser.phoneNumber,
                            updatedRoles,
                            id
                        ],
                        function (error, results, fields) {
                            connection.release()

                            if (error) {
                                logger.error(error)
                                callback(error, null)
                            } else {
                                logger.debug(results)

                                connection.query(
                                    'SELECT * FROM `user` WHERE `id` = ?',
                                    [id],
                                    function (error, updatedUserResults) {
                                        if (error) {
                                            logger.error(error)
                                            callback(error, null)
                                        } else {
                                            if (updatedUserResults.length > 0) {
                                                updatedUserResults[0].roles =
                                                    updatedUserResults[0].roles.split(
                                                        ','
                                                    )
                                            }
                                            callback(null, {
                                                status: 200,
                                                message: `User with id ${id} updated.`,
                                                data: updatedUserResults[0]
                                            })
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
            )
        })
    },

    delete: (UserId, callback) => {
        logger.info('delete', UserId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `meal` WHERE `cookId` = ?',
                [UserId],
                function (error, mealResults) {
                    if (error) {
                        logger.error(error)
                        connection.release()
                        callback(error, null)
                        return
                    }

                    if (mealResults.length > 0) {
                        connection.release()
                        callback({
                            status: 409,
                            message: `Cannot delete user with id ${UserId} because there are related meals.`,
                            data: {}
                        })
                        return
                    }

                    connection.query(
                        'DELETE FROM `user` WHERE `id` = ?',
                        [UserId],
                        function (error, results) {
                            connection.release()

                            if (error) {
                                logger.error(error)
                                callback(error, null)
                            } else {
                                logger.debug(results)
                                if (results.affectedRows === 0) {
                                    callback(
                                        {
                                            message: `Error: id ${UserId} does not exist!`
                                        },
                                        null
                                    )
                                    return
                                }
                                callback(null, {
                                    message: `Deleted user with id ${UserId}.`,
                                    data: null,
                                    status: 200
                                })
                            }
                        }
                    )
                }
            )
        })
    }
}

module.exports = userService
