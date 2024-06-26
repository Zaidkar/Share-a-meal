const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const validateToken = require('./authentication.routes').validateToken
const validateAuthorizeUser =
    require('./authentication.routes').validateAuthorizeUser
const logger = require('../util/logger')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    res.status(404).json({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

const validateUserChaiExpect = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        chai.expect(req.body.firstName).to.not.be.empty
        chai.expect(req.body.firstName).to.be.a('string')
        chai
            .expect(req.body.firstName)
            .to.match(/^[a-zA-Z]+$/, 'firstName must be a string'),
            assert(req.body.lastName, 'Missing or incorrect lastName field')
        chai.expect(req.body.lastName).to.not.be.empty
        chai.expect(req.body.lastName).to.be.a('string')
        chai.expect(req.body.lastName).to.match(
            /^[a-zA-Z\s]+$/,
            'lastName must be a string'
        )

        assert(req.body.emailAdress, 'Missing or incorrect email field')
        chai.expect(req.body.emailAdress).to.not.be.empty
        chai.expect(req.body.emailAdress).to.be.a('string')
        chai.expect(req.body.emailAdress).to.match(
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Invalid email address'
        )

        assert(req.body.password, 'Missing or incorrect password field')
        chai.expect(req.body.password).to.not.be.empty
        chai.expect(req.body.password).to.be.a('string')
        chai.expect(req.body.password).to.match(
            /^(?=.*[A-Z])(?=.*\d).{8,}$/,
            'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long'
        )

        assert(req.body.phoneNumber, 'Missing or incorrect phoneNumber field')
        chai.expect(req.body.phoneNumber).to.not.be.empty
        chai.expect(req.body.phoneNumber).to.be.a('string')
        chai.expect(req.body.phoneNumber).to.match(
            /^06[\s-]?\d{8}$/,
            'phoneNumber must be in the format 06-12345678, 06 12345678, or 0612345678'
        )

        next()
    } catch (ex) {
        let statusCode = 400

        return res.status(statusCode).json({
            status: statusCode,
            message: ex.message,
            data: {}
        })
    }
}

// Userroutes
router.post('/api/user', validateUserChaiExpect, userController.create)

router.get('/api/user', validateToken, userController.getAll)

router.get('/api/user/profile', validateToken, userController.getProfile)

router.get('/api/user/:userId', validateToken, userController.getById)

router.put(
    '/api/user/:userId',
    validateUserChaiExpect,
    validateToken,
    validateAuthorizeUser,
    userController.update
)

router.delete(
    '/api/user/:userId',
    validateToken,
    validateAuthorizeUser,
    userController.delete
)

module.exports = router
