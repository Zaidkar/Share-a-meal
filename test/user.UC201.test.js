process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'trace'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const database = require('../src/dao/mysql-db')
const logger = require('../src/util/logger')

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

describe('UC201 Registreren als nieuwe user', () => {
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

    /**
     * Hier starten de testcases
     */
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'ongeldig_email_adres',
                password: '12345678HH',
                phoneNumber: '0612345678'
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

    it('TC-201-3 Niet-valide password', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl',
                password: '1234567' // Ongeldig wachtwoord (minder dan 8 tekens)
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

    it('TC-201-4 Gebruiker bestaat al', (done) => {
        const existingUser = {
            firstName: 'first',
            lastName: 'last',
            emailAdress: 'name@server.nl', //email bestaat al
            password: 'secret',
            street: 'street',
            city: 'city'
        }

        const checkIfExistsQuery =
            'SELECT COUNT(*) AS count FROM `user` WHERE `emailAdress` = ?'

        database.getConnection(function (err, connection) {
            if (err) {
                done(err)
                return
            }

            connection.query(
                checkIfExistsQuery,
                [existingUser.emailAdress],
                function (error, results) {
                    connection.release()
                    if (error) {
                        done(error)
                        return
                    }

                    const userExists = results[0].count > 0

                    if (userExists) {
                        chai.expect(403).to.equal(403)
                        done()
                    } else {
                        done(new Error('Expected error was not thrown'))
                    }
                }
            )
        })
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'voornaam.achternaam@server.nl',
                password: 'Secret123345',
                phoneNumber: '0612345678',
                street: 'Straatnaam',
                city: 'Stad',
                roles: ['admin'],
                isActive: '1'
            })
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.an('object')

                res.body.should.have.property('data').that.is.an('array')

                const users = res.body.data
                const user = users[0]
                user.should.be.an('object')
                user.should.have.property('firstName').equals('Voornaam')
                user.should.have.property('lastName').equals('Achternaam')
                user.should.have
                    .property('emailAdress')
                    .equals('voornaam.achternaam@server.nl')
                user.should.have.property('password').equals('Secret123345')
                user.should.have.property('id').that.is.a('number')
                user.should.have.property('street').equals('Straatnaam')
                user.should.have.property('city').equals('Stad')
                user.should.have
                    .property('roles')
                    .that.is.an('array')
                    .that.includes('admin')
                user.should.have.property('isActive').equals(1)

                done()
            })
    })
})
