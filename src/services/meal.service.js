const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const mealService = {
    create: (meal, cookId, callback) => {
        logger.info('meal:', meal, 'cookId:', cookId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(