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

describe('UC-205 Updaten van usergegevens', () => {
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

    it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', (done) => {
        chai.request(server)
            .put(`${endpointToTest}/0`)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                // emailAdress ontbreekt
                password: 'Secret1234',
                phoneNumber: '0612345678'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect email field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-205-2 Gebruiker is niet de eigenaar van de data', (done) => {
        const token = jwt.sign({ userId: 2 }, jwtSecretKey)

        chai.request(server)
            .put(`${endpointToTest}/1`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl',
                password: 'Secret1234',
                phoneNumber: '0612345678'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(403)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(
                        `You are not authorized to modify or delete another user's data!`
                    )
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
        chai.request(server)
            .put(`${endpointToTest}/0`)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl',
                password: 'Secret2334',
                phoneNumber: '1234567890'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
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
                    if (error) return done(error)
                    if (results.length === 0) {
                        chai.request(server)
                            .get(`${endpointToTest}/${nonExistingUserId}`)
                            .set('Authorization', `Bearer ${token}`)
                            .end((err, res) => {
                                if (err) return done(err)
                                res.should.have.status(404)
                                done()
                            })
                    }
                }
            )
        })
    })

    it('TC-205-5 Token ongeldig voor update / niet ingelogd', (done) => {
        const invalidToken = 'ongeldige_token'

        chai.request(server)
            .put(`${endpointToTest}/1`)
            .set('Authorization', `Bearer ${invalidToken}`)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'voornaam.achternaam@server.nl',
                password: 'Secret123345',
                phoneNumber: '0612345678',
                street: 'Straatnaam',
                city: 'Stad',
                roles: ['admin'],
                isActive: 1
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(401)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Not authorized!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey)

        chai.request(server)
            .put(`/api/user/1`)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'voornaam.achternaam@server.nl',
                password: 'Secret123345',
                phoneNumber: '0612345678',
                street: 'Straatnaam',
                city: 'Stad',
                roles: ['admin'],
                isActive: 1
            })
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)

                const data = res.body.data
                chai.expect(data)
                    .to.have.property('firstName')
                    .equals('Voornaam')
                chai.expect(data)
                    .to.have.property('lastName')
                    .equals('Achternaam')
                chai.expect(data)
                    .to.have.property('emailAdress')
                    .equals('voornaam.achternaam@server.nl')
                chai.expect(data)
                    .to.have.property('phoneNumber')
                    .equals('0612345678')
                chai.expect(data)
                    .to.have.property('street')
                    .equals('Straatnaam')
                chai.expect(data).to.have.property('city').equals('Stad')
                chai.expect(data)
                    .to.have.property('roles')
                    .that.is.an('array')
                    .that.includes('admin')
                chai.expect(data).to.have.property('isActive').equals(1)
                done()
            })
    })
})
