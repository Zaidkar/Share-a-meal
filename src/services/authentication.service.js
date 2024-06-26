const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
const logger = require('../util/logger')
const jwtSecretKey = require('../util/config').secretkey

const authController = {
    login: (userCredentials, callback) => {
        logger.debug('login')

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err.message, null)
            }
            if (connection) {
                // Check if the user account exists.
                connection.query(
                    'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?',
                    [userCredentials.emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            logger.error('Error: ', err.toString())
                            callback(err.message, null)
                        }
                        if (rows && rows.length === 1) {
                            // User found, check the password.
                            if (rows[0].password === userCredentials.password) {
                                logger.trace(
                                    'Passwords matched, sending user info and valid token'
                                )
                                const { password, ...userinfo } = rows[0]
                                const payload = {
                                    userId: userinfo.id
                                }
                                jwt.sign(
                                    payload,
                                    jwtSecretKey,
                                    { expiresIn: '12d' },
                                    (err, token) => {
                                        logger.trace(
                                            'User logged in, sending user info and token'
                                        )
                                        callback(null, {
                                            status: 200,
                                            message: 'User logged in',
                                            data: { ...userinfo, token }
                                        })
                                    }
                                )
                            } else {
                                logger.trace('Password incorrect')
                                callback(
                                    {
                                        status: 400,
                                        message: 'Password incorrect',
                                        data: {}
                                    },
                                    null
                                )
                            }
                        } else {
                            logger.trace('User not found')
                            callback(
                                {
                                    status: 404,
                                    message: 'User not found',
                                    data: {}
                                },
                                null
                            )
                        }
                    }
                )
            }
        })
    }
}

module.exports = authController
