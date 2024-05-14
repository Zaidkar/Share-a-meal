const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)

const endpointToTest = '/api/user'

describe('UC202 Registreren als nieuwe user', () => {
    it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.an('array')
                    .with.lengthOf.at.least(2)
                done()
            })
    })

    it.skip('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden.', (done) => {
        done()
    })

    it.skip('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld `isActive`=false', (done) => {
        done()
    })

    it.skip('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld `isActive`=true', (done) => {
        done()
    })

    it.skip('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', (done) => {
        done()
    })
})
