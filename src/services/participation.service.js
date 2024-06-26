const db = require('../dao/mysql-db')
const logger = require('../util/logger')
const mealService = require('./meal.service')

const registrationService = {
    registerForMeal: (userId, mealId, token, callback) => {
        if (!validateToken(token)) {
            const error = {
                status: 401,
                message: 'Unauthorized: Invalid or expired token.'
            }
            logger.error('Unauthorized: Invalid or expired token.')
            return callback(error, null)
        }

        mealService.getById(mealId, (mealError, meal) => {
            if (mealError) {
                logger.error(
                    `Error fetching meal with id ${mealId}: ${mealError}`
                )
                return callback(mealError, null)
            }

            if (!meal || !meal.isActive) {
                const error = {
                    status: 404,
                    message: `Meal with id ${mealId} not found or is not active.`
                }
                logger.error(
                    `Meal with id ${mealId} not found or is not active.`
                )
                return callback(error, null)
            }

            if (meal.currentParticipants >= meal.maxAmountOfParticipants) {
                const error = {
                    status: 403,
                    message:
                        'Maximum number of participants reached for this meal.'
                }
                logger.error(
                    'Maximum number of participants reached for this meal.'
                )
                return callback(error, null)
            }

            const connection = db.getConnection()
            connection.query(
                'INSERT INTO meal_participants (mealId, userId) VALUES (?, ?)',
                [mealId, userId],
                (insertError, results) => {
                    connection.release()

                    if (insertError) {
                        logger.error(
                            `Error inserting participant for meal ${mealId}: ${insertError}`
                        )
                        return callback(insertError, null)
                    }

                    mealService.update(
                        mealId,
                        { currentParticipants: meal.currentParticipants + 1 },
                        userId,
                        (updateError) => {
                            if (updateError) {
                                logger.error(
                                    `Error updating meal participants for meal ${mealId}: ${updateError}`
                                )
                                return callback(updateError, null)
                            }

                            const registrationId = results.insertId
                            logger.info(
                                `User ${userId} successfully registered for meal ${mealId}`
                            )

                            const response = {
                                message: 'Registration successful.',
                                registrationId: registrationId,
                                meal: meal
                            }

                            callback(null, response)
                        }
                    )
                }
            )
        })
    }
}

module.exports = registrationService
