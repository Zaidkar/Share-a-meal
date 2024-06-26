const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

describe('UC-206 Verwijderen van User', () => {
    let authToken

    before((done) => {
        authToken = jwt.sign({ userId: 1 }, jwtSecretKey)
        done()
    })

    it('TC-206-1 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .delete('/api/user/123')
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .that.includes('not be found')
                done()
            })
    })

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
        chai.request(server)
            .delete('/api/user/1')
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .that.includes('deleted successfully')
                done()
            })
    })
})
