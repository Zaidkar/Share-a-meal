process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'trace'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const database = require('../src/dao/mysql-db')
const logger = require('../src/util/logger')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

describe('UC-206 Verwijderen van user', () => {
    beforeEach((done) => {
        logger.debug('beforeEach called')
        database.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                    connection.release()
                    if (error) throw error
                    logger.debug('beforeEach done')
                    done()
                }
            )
        })
    })

    it('TC-206-1 Gebruiker bestaat niet', (done) => {
        const nonExistingUserId = 7
        const deleteQuery = 'DELETE FROM `user` WHERE `id` = ?'

        database.getConnection(function (err, connection) {
            if (err) {
                done(err)
                return
            }

            connection.query(
                deleteQuery,
                [nonExistingUserId],
                function (error, results) {
                    connection.release()
                    if (error) {
                        done(error)
                        return
                    }

                    chai.expect(results.affectedRows).to.equal(0)
                    done()
                }
            )
        })
    })

    it('TC-206-2 Gebruiker niet ingelogd', (done) => {
        chai.request(server)
            .delete(`${endpointToTest}/1`)
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('status').equals(401)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Authorization header missing!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.an('object').that.is.empty
                done()
            })
    })

    it('TC-206-3 Gebruiker is niet de eigenaar van de data', (done) => {
        const token = jwt.sign({ userId: 2 }, jwtSecretKey)

        chai.request(server)
            .delete(`${endpointToTest}/1`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('status').equals(403)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.an('object').that.is.empty
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(
                        `Unable to modify or delete data not beloning to your account`
                    )
                done()
            })
    })

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
        const existingUserId = 1
        const token = jwt.sign({ userId: 1 }, jwtSecretKey)

        chai.request(server)
            .delete(`/api/user/${existingUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Deleted user with id 1.')
                done()
            })
    })
})
