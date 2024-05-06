const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)

describe('UC-206 Verwijderen van User', () => {
    it('TC-206-1 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .del('/api/user/123')
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.an('object')
                done()
            })
    })

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
        chai.request(server)
            .del('/api/user/1')
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.an('object')
                done()
            })
    })
})
