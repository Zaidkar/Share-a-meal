const express = require('express')
const router = express.Router()
const participationController = require('../controllers/participation.controller')
const validateToken = require('./authentication.routes').validateToken

const validateParticipationCreateChaiExpect = (req, res, next) => {
    try {
        chai
            .expect(req.body.userId, 'Missing or incorrect userId field')
            .to.be.a('string').and.to.not.be.empty
        chai
            .expect(req.body.mealId, 'Missing or incorrect mealId field')
            .to.be.a('string').and.to.not.be.empty
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
    '/api/meal/:mealId/participate',
    validateToken,
    validateParticipationCreateChaiExpect,
    participationController.participate
)

router.delete(
    '/api/meal/:mealId/participate',
    validateToken,
    participationController.cancelParticipation
)

router.get(
    '/api/meal/:mealId/participants',
    validateToken,
    participationController.getParticipants
)

module.exports = router
