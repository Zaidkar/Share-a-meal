const mealService = require('../services/meal.service')
const logger = require('../util/logger')

let mealController = {
    create: (req, res, next) => {
        logger.trace(`create mealController: ${mealId}`)

        const meal = req.body
        const userId = req.userId

        mealService.create(meal, userId, (error, success) => {
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
        const mealId = req.params.mealId
        const meal = req.body
        const userId = req.userId
        logger.trace(`update mealController: ${mealId}`)
        mealService.update(mealId, meal, userId, (error, success) => {
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
        })
    },

    delete: (req, res, next) => {
        const mealId = req.params.mealId
        const userId = req.userId
        logger.trace(`delete mealController: ${mealId}`)
        mealService.delete(mealId, userId, (error, success) => {
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
        logger.trace('getAll mealController')
        mealService.getAll((error, success) => {
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
        const mealId = req.params.mealId
        logger.trace(`getById mealController: ${mealId}`)
        mealService.getById(mealId, (error, success) => {
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
    },

    getAllParticipants: (req, res, next) => {
        const mealId = req.params.mealId
        logger.info('getAllParticipants', mealId)
        mealService.getAllParticipants(mealId, (error, success) => {
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
        })
    }
}

module.exports = mealController
