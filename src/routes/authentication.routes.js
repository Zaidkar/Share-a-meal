//
// Authentication routes
//
const assert = require('assert')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../util/config').secretkey
const routes = require('express').Router()
const AuthController = require('../controllers/authentication.controller')
const logger = require('../util/logger')

//
//
//
function validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
        assert(
            typeof req.body.emailAdress === 'string',
            'email must be a string.'
        )
        assert(
            typeof req.body.password === 'string',
            'password must be a string.'
        )
        next()
    } catch (ex) {
        next({
            status: 409,
            message: ex.toString(),
            data: {}
        })
    }
}

//
//
//
function validateToken(req, res, next) {
    logger.info('validateToken called')
    logger.trace('Headers:', req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
        logger.warn('Authorization header missing!')
        next({
            status: 401,
            message: 'Authorization header missing!',
            data: {}
        })
    } else {
        // Strip the word 'Bearer ' from the headervalue
        const token = authHeader.substring(7, authHeader.length)

        jwt.verify(token, jwtSecretKey, (err, payload) => {
            if (err) {
                logger.warn('Not authorized')
                next({
                    status: 401,
                    message: 'Not authorized!',
                    data: {}
                })
            }
            if (payload) {
                logger.debug('token is valid', payload)
                /**
                 * User heeft toegang.
                 * BELANGRIJK! Voeg UserId uit payload toe aan request,
                 * zodat die voor ieder volgend endpoint beschikbaar is.
                 * Je hebt dan altijd toegang tot de userId van de ingelogde gebruiker.
                 */
                req.userId = payload.userId
                next()
            }
        })
    }
}

routes.post('/login', validateLogin, AuthController.login)

module.exports = { routes, validateToken }
