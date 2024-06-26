const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const validateToken = require('./authentication.routes').validateToken

const validateMealCreateChaiExpect = (req, res, next) => {
    try {
        assert(req.body.name, 'name field is missing or incorrect')
        chai.expect(req.body.name).to.be.a('string')

        assert(
            req.body.description,
            'description field is missing or incorrect'
        )
        chai.expect(req.body.description).to.be.a('string')

        assert(req.body.price, 'price field is missing or incorrect')
        chai.expect(req.body.price).to.be.a('number')

        assert(req.body.dateTime, 'dateTime field is missing or incorrect')
        chai.expect(req.body.dateTime).to.be.a('string')

        assert(
            req.body.maxAmountOfParticipants,
            'maxAmountOfParticipants field is missing or incorrect'
        )
        chai.expect(req.body.maxAmountOfParticipants).to.be.a('number')

        assert(req.body.imageUrl, 'imageUrl field is missing or incorrect')
        chai.expect(req.body.imageUrl).to.be.a('string')

        next()
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateMealUpdateChaiExpect = (req, res, next) => {
    try {
        assert(req.body.name, 'name field is missing or incorrect')
        chai.expect(req.body.name).to.be.a('string')
        chai.expect(req.body.name).to.exist

        assert(req.body.price !== undefined, 'price field is missing')
        chai.expect(req.body.price).to.be.a('number')
        chai.expect(req.body.price).to.exist

        assert(
            req.body.maxAmountOfParticipants !== undefined,
            'maxAmountOfParticipants field is missing or incorrect'
        )
        chai.expect(req.body.maxAmountOfParticipants).to.be.a('number')
        chai.expect(req.body.maxAmountOfParticipants).to.exist

        next()
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

router.post(
    '/api/meal',
    validateToken,
    validateMealCreateChaiExpect,
    mealController.create
)

router.get('/api/meal', validateToken, mealController.getAll)

router.get('/api/meal/:mealId', validateToken, mealController.getById)

router.delete('/api/meal/:mealId', validateToken, mealController.delete)

router.put(
    '/api/meal/:mealId',
    validateToken,
    validateMealUpdateChaiExpect,
    mealController.update
)

router.get(
    '/api/meal/:mealId/participants',
    validateToken,
    mealController.getAllParticipants
)

module.exports = router
