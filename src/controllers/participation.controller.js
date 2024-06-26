const participationService = require('../services/participation.service')
const logger = require('../util/logger')

let participationController = {
    getAllParticipants: (req, res, next) => {
        const mealId = parseInt(req.params.mealid, 10)
        logger.trace(`getAllParticipants called with mealId: ${mealId}`)

        participationService.getAllParticipants(mealId, (error, result) => {
            if (error) {
                logger.error(
                    `Error in participationController.getAllParticipants: ${error.message}`
                )
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (result) {
                logger.info(
                    `Participants successfully fetched for mealId: ${mealId}`
                )
                res.status(result.status).json({
                    status: result.status,
                    message: result.message,
                    data: result.data
                })
            }
        })
    }
}

module.exports = participationController
