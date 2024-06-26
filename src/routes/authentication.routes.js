//
// Authentication routes
//
const assert = require('assert')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../util/config').secretkey
const routes = require('express').Router()
const mealService = require('../services/meal.service')
const userService = require('../services/user.service')
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
            status: 400,
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

// Middleware to authorize user
function validateAuthorizeUser(req, res, next) {
    logger.info('authorizeUser called')
    logger.trace('Headers:', req.headers)

    const token =
        req.headers.authorization && req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.decode(token)
    const tokenUserId = decodedToken ? decodedToken.userId : null

    if (!tokenUserId) {
        logger.warn('User ID missing from token!')
        return next({
            status: 401,
            message: 'User ID missing from token!',
            data: {}
        })
    }

    const requestedUserId = req.params.userId

    userService.getById(requestedUserId, (error, result) => {
        if (error) {
            return next({
                status: 404,
                message: `User with ID ${requestedUserId} does not exist!`,
                data: {}
            })
        }

        if (parseInt(requestedUserId) !== tokenUserId) {
            logger.warn(
                `You are not authorized to modify or delete another user's data!`
            )
            return next({
                status: 403,
                message: `You are not authorized to modify or delete another user's data!`,
                data: {}
            })
        }

        next()
    })
}

// Middleware to authorize meal
function validateAuthorizeMeal(req, res, next) {
    logger.info('authorizeMeal called')
    logger.trace('Headers:', req.headers)

    const token =
        req.headers.authorization && req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.decode(token)
    const tokenUserId = decodedToken ? decodedToken.userId : null

    if (!tokenUserId) {
        logger.warn('User ID missing from token!')
        return next({
            status: 401,
            message: 'User ID missing from token!',
            data: {}
        })
    }

    const requestedMealId = req.params.mealId

    mealService.getById(requestedMealId, (error, result) => {
        if (error) {
            return next({
                status: 404,
                message: 'Meal not found',
                data: {}
            })
        }

        const mealCookId =
            result.data && result.data[0] ? result.data[0].cookId : null

        if (!mealCookId) {
            logger.warn('Cook ID missing from meal!')
            return next({
                status: 403,
                message: 'Cook ID missing from meal!',
                data: {}
            })
        }

        if (tokenUserId !== mealCookId) {
            logger.warn(
                `You are not authorized to modify or delete another user's data!`
            )
            return next({
                status: 403,
                message: `You are not authorized to modify or delete another user's data!`,
                data: {}
            })
        }

        next()
    })
}

// Middleware to validate non-empty login
function validateLoginNotEmpty(req, res, next) {
    logger.info('validateLoginNotEmpty called')
    logger.trace('Body:', req.body)

    try {
        const email = req.body.emailAdress
        const password = req.body.password

        if (!email || email.trim() === '') {
            return next({
                status: 400,
                message: 'email is required.',
                data: {}
            })
        }

        if (!password || password.trim() === '') {
            return next({
                status: 400,
                message: 'password is required.',
                data: {}
            })
        }

        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

// Route for login
routes.post(
    '/api/login',
    validateLoginNotEmpty,
    validateLogin,
    AuthController.login
)

// Exporting the routes and middleware
module.exports = {
    routes,
    validateAuthorizeUser,
    validateToken,
    validateAuthorizeMeal
}
