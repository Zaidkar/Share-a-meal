const express = require('express')
const router = express.Router()
const participationController = require('../controllers/participation.controller')
const validateToken = require('./authentication.routes').validateToken

router.get(
    '/api/meal/:mealid/participants',
    validateToken,
    participationController.getAllParticipants
)

module.exports = router
