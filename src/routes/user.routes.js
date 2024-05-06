const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    res.status(404).json({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

// Userroutes
router.post('/api/users', userController.create)
router.get('/api/users', userController.getAll)
router.get('/api/users/:userId', userController.getById)

// Tijdelijke routes om niet bestaande routes op te vangen
router.put('/api/users/:userId', userController.update)
router.delete('/api/users/:userId', userController.deleteById)

module.exports = router
