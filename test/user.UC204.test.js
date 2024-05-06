const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)

describe('UC204 Opvragen van usergegevens bij ID', () => {
    it.skip('TC-204-1 Ongeldig token', (done) => {
        done()
    })

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        chai.request(server)
            .get('/api/user/1321')
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.an('object')
                done()
            })
    })

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
        chai.request(server)
            .get('/api/user/1')
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.an('object')
                done()
            })
    })
})
