const db = require('../dao/mysql-db')
const logger = require('../util/logger')
const userService = require('./user.service')

const participationService = {
    getAllParticipants: (mealId, callback = () => {}) => {
        logger.info(`Fetching participants for meal ID: ${mealId}`)

        db.query(
            'SELECT userId FROM meal_participants_user WHERE mealId = ?',
            [mealId],
            (error, results) => {
                if (error) {
                    logger.error(
                        `Database error while fetching participants for meal ID ${mealId}: ${error.message}`
                    )
                    return callback({
                        status: 500,
                        message: 'Internal Server Error',
                        data: {}
                    })
                }

                if (results.length === 0) {
                    logger.warn(`No participants found for meal ID ${mealId}`)
                    return callback({
                        status: 404,
                        message: `Meal with ID ${mealId} does not exist.`,
                        data: {}
                    })
                }

                const userIds = []
                for (let i = 0; i < results.length; i++) {
                    userIds.push(results[i].userId)
                }

                const userDetails = []

                let index = 0

                const fetchNextUserDetail = () => {
                    if (index >= userIds.length) {
                        logger.info(
                            `Participants found for meal ID ${mealId}: ${userDetails.length} participants`
                        )
                        return callback(null, {
                            status: 200,
                            message: `Found ${userIds.length} participants for meal ID ${mealId}`,
                            data: userDetails
                        })
                    }

                    userService.getByIdName(
                        userIds[index],
                        (userError, userResult) => {
                            if (userError) {
                                logger.error(
                                    `Error fetching details for user ID ${userIds[index]}: ${userError.message}`
                                )
                                return callback({
                                    status: 500,
                                    message:
                                        'Internal Server Error while fetching user details',
                                    data: {}
                                })
                            }

                            userDetails.push(userResult.data.user)
                            index++
                            fetchNextUserDetail()
                        }
                    )
                }

                fetchNextUserDetail()
            }
        )
    }
}

module.exports = participationService
