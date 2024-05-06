const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)

const endpointToTest = '/api/user'

describe('UC201 Registreren als nieuwe user', () => {
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('firstName field is missing or incorrect')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide emailadres', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Mark',
                lastName: 'Van Dam',
                emailAdress: '@server.nl',
                password: 'Secret12',
                isActive: false,
                street: 'Lovensdijkstraat 61',
                city: 'Breda',
                phoneNumber: '06 12312345',
                roles: []
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-3 Niet-valide wachtwoord', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Hendrik',
                lastName: 'Van Dam',
                emailAdress: 'h.vd@server.nl',
                password: 'Secret12',
                isActive: false,
                street: 'Lovensdijkstraat 61',
                city: 'Breda',
                phoneNumber: '06 12312345',
                roles: []
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(403)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-201-4 Gebruiker bestaat al', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Mark',
                lastName: 'Van Dam',
                emailAdress: 'h.vd@server.nl',
                password: 'secret12',
                isActive: false,
                street: 'Lovensdijkstraat 61',
                city: 'Breda',
                phoneNumber: '06 12312345',
                roles: []
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(403)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Mark',
                lastName: 'Van Dam',
                emailAdress: 'm.vandam@server.nl',
                password: 'Secret12',
                isActive: false,
                street: 'Lovensdijkstraat 61',
                city: 'Breda',
                phoneNumber: '06 12312345',
                roles: []
            })
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.a('object')

                res.body.should.have.property('data').that.is.a('object')
                res.body.should.have.property('message').that.is.a('string')

                const data = res.body.data
                data.should.have.property('firstName').equals('Mark')
                data.should.have.property('lastName').equals('Van Dam')
                data.should.have.property('emailAdress')
                data.should.have.property('password')
                data.should.have.property('isActive')
                data.should.have.property('street')
                data.should.have.property('city')
                data.should.have.property('phoneNumber')
                data.should.have.property('id').that.is.a('number')

                done()
            })
    })
})
