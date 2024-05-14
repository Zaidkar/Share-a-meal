const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const validateToken = require('./authentication.routes').validateToken
const logger = require('../util/logger')
const authController = require('../services/authentication.service')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    res.status(404).json({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

// Input validation functions for user routes
const validateUserCreate = (req, res, next) => {
    if (!req.body.emailAdress || !req.body.firstName || !req.body.lastName) {
        return res.status(400).json({
            status: 400,
            message: 'Missing email or password',
            data: {}
        })
    }
    next()
}

// Input validation function 2 met gebruik van assert
const validateUserCreateAssert = (req, res, next) => {
    try {
        assert(req.body.emailAdress, 'Missing email')
        assert(req.body.firstName, 'Missing first name')
        assert(req.body.lastName, 'Missing last name')
        next()
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

// Input validation function 2 met gebruik van assert
const validateUserCreateChaiShould = (req, res, next) => {
    try {
        req.body.firstName.should.not.be.empty.and.a('string')
        req.body.lastName.should.not.be.empty.and.a('string')
        req.body.emailAdress.should.not.be.empty.and.a('string').and.match(/@/)
        next()
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        chai.expect(req.body.firstName).to.not.be.empty
        chai.expect(req.body.firstName).to.be.a('string')
        next()
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserChaiExpect = (req, res, next) => {
    try {
        assert(req.body.firstName, 'firstName field is missing or incorrect')
        chai.expect(req.body.firstName).to.be.a('string')
        chai.expect(req.body.firstName).to.not.be.empty

        assert(req.body.lastName, 'lastName field is missing or incorrect')
        chai.expect(req.body.lastName).to.be.a('string')
        chai.expect(req.body.lastName).to.not.be.empty

        assert(
            req.body.emailAdress,
            'emailAdress field is missing or incorrect'
        )
        chai.expect(
            req.body.emailAdress,
            'emailAdress field is missing or incorrect'
        ).to.be.a('string')
        chai.expect(
            req.body.emailAdress,
            'emailAdress field is missing or incorrect'
        ).to.not.be.empty
        chai.expect(req.body.emailAdress).to.match(
            /^\w+([\.]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Email must follow the format where by f.lastname@domain.com. firstname at least 1 character, lastname at least 2 characters domain also atleast 2 characters and domain extension 2 to 3 characters'
        )

        assert(req.body.password, 'password field is missing or incorrect')
        chai.expect(req.body.password).to.be.a('string')
        chai.expect(req.body.password).to.not.be.empty
        chai.expect(req.body.password).to.match(
            /^(?=.*[A-Z])(?=.*\d).{8,}$/,
            'Password must be at least 8 characters long contain a digit and a capital letter'
        )

        assert(req.body.street, 'street field is missing or incorrect')
        chai.expect(req.body.street).to.be.a('string')
        chai.expect(req.body.street).to.not.be.empty

        assert(req.body.city, 'city field is missing or incorrect')
        chai.expect(req.body.city).to.be.a('string')
        chai.expect(req.body.city).to.not.be.empty

        assert(
            req.body.phoneNumber,
            'phoneNumber field is missing or incorrect'
        )
        chai.expect(req.body.phoneNumber).to.be.a('string')
        chai.expect(req.body.phoneNumber).to.not.be.empty
        chai.expect(req.body.phoneNumber).to.match(
            /^06[\s-]?\d{8}$/,
            'Phone number must be at least 10 characters long and start with 06 and can have either a hypen or empty space or nothing after the 06'
        )

        next()
    } catch (ex) {
        return res.status(400).json({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserUniqueEmail = (req, res, next) => {
    // const emailExists = database._data.some(
    //     (user) => user.emailAdress === req.body.emailAdress
    // )

    // if (emailExists) {
    //     return res.status(403).json({
    //         status: 403,
    //         message: 'User with email address already exists',
    //         data: {}
    //     })
    // }

    next()
}

// Userroutes
router.post(
    '/api/user',
    validateUserUniqueEmail,
    validateUserChaiExpect,
    userController.create
)
router.get('/api/user', userController.getAll)
router.get('/api/user/:userId', userController.getById)
router.put('/api/user/:userId', validateUserChaiExpect, userController.update)
router.delete('/api/user/:userId', userController.delete)
router.get('/api/user/profile', validateToken, userController.getProfile)

module.exports = router
