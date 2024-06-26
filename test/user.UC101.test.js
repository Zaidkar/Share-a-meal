const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const db = require('../src/dao/mysql-db')
const logger = require('../src/util/logger')

chai.should()
chai.use(chaiHttp)

const endpointToTest = '/api/login'

describe('UC101 inloggen', () => {
    const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
    const CLEAR_PARTICIPANTS_TABLE =
        'DELETE IGNORE FROM `meal_participants_user`;'
    const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'

    const CLEAR_DB =
        CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

    const INSERT_USERS = `INSERT INTO \`user\` VALUES 
        (1,'Mariëtte','van den Dullemen',1,'m.vandullemen@server.nl','secret','','','',''),
        (2,'John','Doe',1,'j.doe@server.com','secret','06 12425475','editor,guest','',''),
        (3,'Herman','Huizinga',1,'h.huizinga@server.nl','secret','06-12345678','editor,guest','',''),
        (4,'Marieke','Van Dam',0,'m.vandam@server.nl','secret','06-12345678','editor,guest','',''),
        (5,'Henk','Tank',1,'h.tank@server.com','secret','06 12425495','editor,guest','','');`

    beforeEach((done) => {
        db.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                CLEAR_DB + INSERT_USERS,
                function (error, results, fields) {
                    connection.release()
                    if (error) throw error
                    done()
                }
            )
        })
    })

    afterEach((done) => {
        db.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(CLEAR_DB, function (error, results, fields) {
                connection.release()
                if (error) throw error
                done()
            })
        })
    })

    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAddress: 'v.a@server.nl' // Corrected property name
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

    it('TC-101-2 Niet-valide password', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAddress: 'name@server.nl',
                password: '1234567'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-101-3 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAddress: 'non_existing_email@example.com',
                password: '12345678'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                done()
            })
    })

    it('TC-101-4 User successfully logged in', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAddress: 'm.vandam@server.nl',
                password: 'secret'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object')
                chai.expect(res.body.data)
                    .to.have.property('token')
                    .that.is.a('string')
                done()
            })
    })
})
