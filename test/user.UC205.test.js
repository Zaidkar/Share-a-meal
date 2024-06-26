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

describe('UC205 Updaten van usergegevens', () => {
    let authToken

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

                    authToken = jwt.sign({ userId: 1 }, jwtSecretKey)

                    done()
                }
            )
        })
    })

    it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', (done) => {
        chai.request(server)
            .put('/api/user/1')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                firstName: 'Mark',
                lastName: 'Van Dam',
                password: 'Secret12',
                isActive: false,
                street: 'Lovensdijkstraat',
                city: 'Breda',
                phoneNumber: '06 12312345',
                roles: []
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('emailAdress field is missing or incorrect')
                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
        chai.request(server)
            .put('/api/user/1')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                firstName: 'Hendrik',
                lastName: 'Van Dam',
                emailAdress: 'h.vd@server.nl',
                password: 'Secret12',
                isActive: false,
                street: 'Lovensdijkstraat',
                city: 'Breda',
                phoneNumber: '06 ',
                roles: []
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                done()
            })
    })

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .put('/api/user/3131')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                firstName: 'Hendrik',
                lastName: 'Van Dam',
                emailAdress: 'h.vd@server.nl',
                password: 'Secret12',
                isActive: false,
                street: 'Lovensdijkstraat',
                city: 'Breda',
                phoneNumber: '06 12312345',
                roles: []
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                done()
            })
    })

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
        chai.request(server)
            .put('/api/user/1')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                firstName: 'Hendrik',
                lastName: 'Van Dam',
                emailAdress: 'h.vd@server.nl',
                password: 'Secret12',
                isActive: false,
                street: 'Lovensdijkstraat',
                city: 'Breda',
                phoneNumber: '06 12312345',
                roles: []
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                done()
            })
    })
})
