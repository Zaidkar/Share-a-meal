const db = require('../dao/mysql-db')
const logger = require('../util/logger')
const userService = require('./user.service')

const participationService = {
    getAllParticipants: (mealId, userId, callback = () => {}) => {
        logger.info(
            `Fetching participants for meal ID: ${mealId} by user ID: ${userId}`
        )

        db.query(
            'SELECT cookId FROM meal WHERE id = ?',
            [mealId],
            (mealError, mealResults) => {
                if (mealError) {
                    logger.error(
                        `Error fetching meal details: ${mealError.message}`
                    )
                    return callback({
                        status: 500,
                        message: 'Internal Server Error',
                        data: {}
                    })
                }

                if (mealResults.length === 0) {
                    logger.warn(`No meal found with ID ${mealId}`)
                    return callback({
                        status: 404,
                        message: `Meal with ID ${mealId} not found.`,
                        data: {}
                    })
                }

                const mealOwner = mealResults[0].cookId

                logger.debug(`Meal owner ID: ${mealOwner}, User ID: ${userId}`)

                if (mealOwner !== userId) {
                    logger.warn(
                        `User ${userId} is not authorized to view participants for meal ${mealId}`
                    )
                    return callback({
                        status: 403,
                        message:
                            'Forbidden: You are not authorized to view this information.',
                        data: {}
                    })
                }

                db.query(
                    'SELECT userId FROM meal_participants_user WHERE mealId = ?',
                    [mealId],
                    (error, results) => {
                        if (error) {
                            logger.error(
                                `Error fetching participants: ${error.message}`
                            )
                            return callback({
                                status: 500,
                                message: 'Internal Server Error',
                                data: {}
                            })
                        }

                        if (results.length === 0) {
                            logger.warn(
                                `No participants found for meal ID ${mealId}`
                            )
                            return callback(null, {
                                status: 200,
                                message: 'No participants found',
                                data: []
                            })
                        }

                        const userIds = results.map((row) => row.userId)
                        const userDetails = []

                        const fetchUserDetails = userIds.map((userId) => {
                            return new Promise((resolve, reject) => {
                                userService.getByIdName(
                                    userId,
                                    (userError, userResult) => {
                                        if (userError) {
                                            reject(userError)
                                        } else {
                                            resolve(userResult.data.user)
                                        }
                                    }
                                )
                            })
                        })

                        Promise.all(fetchUserDetails)
                            .then((userDetails) => {
                                logger.info(
                                    `Participants found for meal ID ${mealId}: ${userDetails.length}`
                                )
                                callback(null, {
                                    status: 200,
                                    message:
                                        'Participants fetched successfully',
                                    data: userDetails
                                })
                            })
                            .catch((error) => {
                                logger.error(
                                    `Error fetching user details: ${error.message}`
                                )
                                callback({
                                    status: 500,
                                    message:
                                        'Internal Server Error while fetching user details',
                                    data: {}
                                })
                            })
                    }
                )
            }
        )
    },

    getParticipantById: (mealId, userId, requesterId, callback) => {
        logger.trace(
            `Fetching participant with userId: ${userId} for mealId: ${mealId} by requesterId: ${requesterId}`
        )

        db.query(
            'SELECT cookId FROM meal WHERE id = ?',
            [mealId],
            (mealError, mealResults) => {
                if (mealError) {
                    logger.error(
                        `Error fetching meal details: ${mealError.message}`
                    )
                    return callback({
                        status: 500,
                        message: 'Internal Server Error',
                        data: {}
                    })
                }

                if (mealResults.length === 0) {
                    logger.warn(`No meal found with ID ${mealId}`)
                    return callback({
                        status: 404,
                        message: `Meal with ID ${mealId} not found.`,
                        data: {}
                    })
                }

                const mealOwner = mealResults[0].cookId
                if (mealOwner !== requesterId) {
                    logger.warn(
                        `Requester ${requesterId} is not authorized to view participant details for meal ${mealId}`
                    )
                    return callback({
                        status: 403,
                        message:
                            'Forbidden: You are not authorized to view this information.',
                        data: {}
                    })
                }
            }
        )

        db.query(
            `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street 
             FROM user 
             WHERE id IN (SELECT userId FROM meal_participants_user WHERE mealId = ? AND userId = ?)`,
            [mealId, userId],
            (err, result) => {
                if (err) {
                    logger.error(
                        'Error fetching participant:',
                        err.message || 'unknown error'
                    )
                    callback(err, null)
                } else {
                    if (result.length === 0) {
                        logger.warn(
                            `Participant not found for userId: ${userId} and mealId: ${mealId}`
                        )
                        callback({
                            status: 404,
                            message: `Participant not found for userId: ${userId} and mealId: ${mealId}`,
                            data: {}
                        })
                    } else {
                        logger.info(
                            `Participant found for userId: ${userId} and mealId: ${mealId}`
                        )
                        callback(null, {
                            status: 200,
                            message: `Found participant for userId: ${userId} and mealId: ${mealId}`,
                            data: result
                        })
                    }
                }
            }
        )
    }
}

module.exports = participationService
