const participationService = require('../services/participation.service')
const logger = require('../util/logger')

let participationController = {
    getAllParticipants: (req, res, next) => {
        const mealId = parseInt(req.params.mealid, 10)
        const userId = req.userId
        logger.trace(`getAllParticipants called with mealId: ${mealId}`)

        participationService.getAllParticipants(
            mealId,
            userId,
            (error, result) => {
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
            }
        )
    },

    getParticipantById: (req, res, next) => {
        logger.info('Controller: get participant by id')
        participationService.getParticipantById(
            parseInt(req.params.mealId),
            parseInt(req.params.participantId),
            req.userId,
            (error, success) => {
                if (error) {
                    next({
                        status: error.status,
                        message: error.message,
                        data: {}
                    })
                }
                if (success) {
                    res.status(200).json({ ...success })
                }
            }
        )
    }
}

module.exports = participationController
