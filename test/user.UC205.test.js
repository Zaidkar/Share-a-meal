const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)

describe('UC205 Updaten van usergegevens', () => {
    it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', (done) => {
        chai.request(server)
            .put('/api/user/1')
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
            .put('/api/user/0')
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
