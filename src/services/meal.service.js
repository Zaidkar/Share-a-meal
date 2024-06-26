const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const mealService = {
    create: (mealData, userId, callback) => {
        logger.info('create meal', mealData)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            let newMealId = null
            connection.query(
                'INSERT INTO `meal` (`isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`, `allergenes`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    mealData.isActive ? 1 : 0 || 1,
                    mealData.isVega ? 1 : 0,
                    mealData.isVegan ? 1 : 0,
                    mealData.isToTakeHome ? 1 : 0,
                    mealData.dateTime,
                    mealData.maxAmountOfParticipants,
                    mealData.price,
                    mealData.imageUrl || null,
                    userId,
                    mealData.name,
                    mealData.description,
                    mealData.allergenes ? mealData.allergenes.join(',') : ''
                ],
                function (error, results) {
                    if (error) {
                        connection.release()
                        logger.error(error)
                        callback(error, null)
                    } else {
                        newMealId = results.insertId

                        connection.query(
                            'SELECT * FROM `meal` WHERE `id` = ?',
                            [newMealId],
                            function (error, mealResults) {
                                connection.release()

                                if (error) {
                                    logger.error(error)
                                    callback(error, null)
                                } else {
                                    if (mealResults.length > 0) {
                                        mealResults[0].allergenes =
                                            mealResults[0].allergenes.split(',')
                                    }

                                    logger.debug(
                                        'Newly created meal:',
                                        mealResults
                                    )
                                    callback(null, {
                                        message: `Meal created with id ${newMealId}.`,
                                        data: mealResults[0],
                                        status: 201
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
    },

    delete: (mealId, userId, callback) => {
        logger.info('delete meal', mealId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `meal` WHERE id = ?',
                [mealId],
                function (error, result) {
                    if (error) {
                        logger.error(error)
                        callback(error, null)
                        return
                    }

                    if (result.length === 0) {
                        const Error404 = new Error()
                        Error404.message = `Meal with id ${mealId} could not be found.`
                        Error404.status = 404
                        logger.error(Error404)
                        callback(Error404, null)
                        return
                    }

                    const cookId = result[0].cookId

                    if (cookId !== userId) {
                        const Error403 = new Error()
                        Error403.message = `User ${userId} is not authorized to delete meal with id ${mealId}.`
                        Error403.status = 403
                        logger.error(Error403)
                        callback(Error403)
                        return
                    }

                    connection.query(
                        'DELETE FROM `meal` WHERE id = ?',
                        [mealId],
                        function (error, results, fields) {
                            connection.release()

                            if (error) {
                                logger.error(error)
                                callback(error, null)
                            } else {
                                logger.debug(results)
                                callback(null, {
                                    message: `Meal with id ${mealId} deleted successfully.`,
                                    data: results
                                })
                            }
                        }
                    )
                }
            )
        })
    },

    update: (mealId, updatedMeal, userId, callback) => {
        logger.info(`Update meal: ${mealId} with id ${userId} with meal`)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `meal` WHERE id = ?',
                [mealId],
                function (error, result) {
                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (result.length > 0) {
                            if (updatedMeal.isActive === undefined) {
                                updatedMeal.isActive = result[0].isActive
                            }
                            if (updatedMeal.isVega === undefined) {
                                updatedMeal.isVega = result[0].isVega
                            }
                            if (updatedMeal.isVegan === undefined) {
                                updatedMeal.isVegan = result[0].isVegan
                            }
                            if (updatedMeal.isToTakeHome === undefined) {
                                updatedMeal.isToTakeHome =
                                    result[0].isToTakeHome
                            }
                            if (updatedMeal.dateTime === undefined) {
                                updatedMeal.dateTime = result[0].dateTime
                            }
                            if (
                                updatedMeal.maxAmountOfParticipants ===
                                undefined
                            ) {
                                updatedMeal.maxAmountOfParticipants =
                                    result[0].maxAmountOfParticipants
                            }
                            if (updatedMeal.price === undefined) {
                                updatedMeal.price = result[0].price
                            }
                            if (updatedMeal.imageUrl === undefined) {
                                updatedMeal.imageUrl = result[0].imageUrl
                            }
                            if (updatedMeal.name === undefined) {
                                updatedMeal.name = result[0].name
                            }
                            if (updatedMeal.description === undefined) {
                                updatedMeal.description = result[0].description
                            }
                            if (
                                updatedMeal.allergenes &&
                                Array.isArray(updatedMeal.allergenes)
                            ) {
                                updatedMeal.allergenes =
                                    updatedMeal.allergenes.join(',')
                            }

                            const cookIdtoCheck = String(result[0].cookId)
                            const cookIdtoCheckAgainst = String(userId)

                            if (!cookIdtoCheck.includes(cookIdtoCheckAgainst)) {
                                const Error403 = new Error()
                                Error403.message = `userId:${userId} does not match cookId of meal cookId:${result[0].cookId}`
                                Error403.status = 403
                                logger.error(Error403)
                                callback(Error403)
                                return
                            }

                            connection.query(
                                'UPDATE `meal` SET `isActive` = ?, `isVega` = ?, `isVegan` = ?, `isToTakeHome` = ?, `dateTime` = ?, `maxAmountOfParticipants` = ?, `price` = ?, `imageUrl` = ?, `name` = ?, `description` = ?, `allergenes` = ? WHERE `id` = ?',
                                [
                                    updatedMeal.isActive,
                                    updatedMeal.isVega,
                                    updatedMeal.isVegan,
                                    updatedMeal.isToTakeHome,
                                    updatedMeal.dateTime,
                                    updatedMeal.maxAmountOfParticipants,
                                    updatedMeal.price,
                                    updatedMeal.imageUrl,
                                    updatedMeal.name,
                                    updatedMeal.description,
                                    updatedMeal.allergenes
                                        ? updatedMeal.allergenes.join(',')
                                        : null,
                                    mealId
                                ],
                                function (error, results, fields) {
                                    connection.release()

                                    if (error) {
                                        logger.error(error)
                                        callback(error, null)
                                    } else {
                                        if (results.affectedRows === 0) {
                                            const Error404 = new Error()
                                            Error404.message = `Meal with id ${mealId} could not be found.`
                                            Error404.status = 404
                                            logger.error(Error404)
                                            callback(Error404)
                                            return
                                        } else {
                                            logger.debug(results)
                                            callback(null, {
                                                message: `Meal with id ${mealId} updated successfully.`,
                                                data: updatedMeal
                                            })
                                        }
                                    }
                                }
                            )
                        } else {
                            const Error404 = new Error()
                            Error404.message = `Meal with id ${mealId} could not be found.`
                            Error404.status = 404
                            logger.error(Error404)
                            callback(Error404, null)
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
                'SELECT * FROM `meal`',
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} meals.`,
                            data: results,
                            status: 200
                        })
                    }
                }
            )
        })
    },

    getById: (mealId, callback) => {
        logger.info('mealsService: getById', mealId)
        db.query(
            'SELECT * FROM meal WHERE id = ?',
            mealId,
            (error, results) => {
                if (error) {
                    logger.error(error)
                    callback(error, null)
                } else {
                    if (results.length === 0) {
                        const noMealError = new Error(
                            `Meal with id ${mealId} not found.`
                        )
                        logger.error(noMealError)
                        callback(noMealError, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found meal with id: ${mealId}.`,
                            data: results
                        })
                    }
                }
            }
        )
    },

    getAllParticipants: (mealId, callback) => {
        logger.info('getAllParticipants for a meal', mealId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `meal` WHERE `id` = ?',
                [mealId],
                function (error, mealResults) {
                    if (error) {
                        logger.error(error)
                        connection.release()
                        callback(error, null)
                        return
                    }

                    if (mealResults.length === 0) {
                        const errorMessage = `Meal with ID ${mealId} does not exist.`
                        logger.warn(errorMessage)
                        connection.release()
                        return callback(
                            { status: 404, message: errorMessage },
                            null
                        )
                    }

                    connection.query(
                        `SELECT 
                        user.id, 
                        user.firstName, 
                        user.lastName, 
                        user.emailAdress, 
                        meal_participants_user.* 
                    FROM 
                        meal_participants_user 
                    JOIN 
                        user ON meal_participants_user.userId = user.id 
                    WHERE 
                        meal_participants_user.mealId = ?`,
                        [mealId],
                        function (error, results) {
                            if (error) {
                                logger.error(error)
                                callback(error, null)
                            } else {
                                callback(null, {
                                    message: `Found ${results.length} participants for meal with ID ${mealId}.`,
                                    data: results,
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

module.exports = mealService
