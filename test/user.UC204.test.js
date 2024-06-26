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

//Database queries
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

describe('UC204 Opvragen ', () => {
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

    it('TC-204-1 Ongeldige token', (done) => {
        chai.request(server)
            .get(`${endpointToTest}/1`)
            .set('Authorization', 'Bearer ' + 'invalid_token')
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('status').equals(401)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Not authorized!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.an('object').that.is.empty

                done()
            })
    })

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        const nonExistingUserId = 7
        const token = jwt.sign({ userId: 1 }, jwtSecretKey)

        database.getConnection(function (err, connection) {
            if (err) return done(err)
            const query = 'SELECT id FROM user WHERE id = ?'
            connection.query(
                query,
                [nonExistingUserId],
                function (error, results, fields) {
                    connection.release()
                    chai.request(server)
                        .get(`${endpointToTest}/${nonExistingUserId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .end((err, res) => {
                            chai.expect(res).to.have.status(404)
                            chai.expect(res.body).to.be.a('object')
                            chai.expect(res.body)
                                .to.have.property('status')
                                .equals(404)
                            done()
                        })
                }
            )
        })
    })

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey)

        chai.request(server)
            .get(`${endpointToTest}/1`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.an('object')
                res.body.should.have.property('data')
                done()
            })
    })
})
