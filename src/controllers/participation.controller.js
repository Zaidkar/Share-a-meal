const participationService = require('../services/participation.service')
const logger = require('../util/logger')

let participationController = {
    create: (req, res, next) => {
        logger.trace('create participationController')

        const participation = req.body
        const userId = req.userId

        participationService.create(participation, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(201).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    update: (req, res, next) => {
        const participationId = req.params.participationId
        const participation = req.body
        const userId = req.userId

        logger.info(
            'update participationController:',
            participationId,
            participation
        )
        participationService.update(
            participationId,
            participation,
            userId,
            (error, success) => {
                if (error) {
                    return next({
                        status: error.status,
                        message: error.message,
                        data: {}
                    })
                }
                if (success) {
                    res.status(200).json({
                        status: success.status,
                        message: success.message,
                        data: success.data
                    })
                }
            }
        )
    },

    delete: (req, res, next) => {
        const participationId = req.params.participationId
        logger.trace('delete participationController:', participationId)
        participationService.delete(participationId, (error, success) => {
            if (error) {
                if (error.status === 404) {
                    return res.status(404).json({
                        status: 404,
                        message: error.message,
                        data: {}
                    })
                } else {
                    return next({
                        status: 500,
                        message: error.message,
                        data: {}
                    })
                }
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getAll: (req, res, next) => {
        logger.trace('getAll participationController')
        participationService.getAll((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getById: (req, res, next) => {
        const participationId = req.params.participationId
        logger.trace('getById participationController:', participationId)
        participationService.getById(participationId, (error, success) => {
            if (error) {
                return next({
                    status: 404,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    }
}

module.exports = participationController
