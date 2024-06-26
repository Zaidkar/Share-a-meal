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

const endpointToTest = '/api/meal'

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USERS = `INSERT INTO \`user\` VALUES 
(1,'Mariëtte','van den Dullemen',1,'m.vandullemen@server.nl','secret','','','','kloosterzande'),
(2,'John','Doe',1,'j.doe@server.com','secret','06 12425475','editor,guest','',''),
(3,'Herman','Huizinga',1,'h.huizinga@server.nl','secret','06-12345678','editor,guest','',''),
(4,'Marieke','Van Dam',0,'m.vandam@server.nl','secret','06-12345678','editor,guest','',''),
(5,'Henk','Tank',1,'h.tank@server.com','secret','06 12425495','editor,guest','','');`

const INSERT_MEALS = `INSERT INTO \`meal\` VALUES 
(1,1,0,0,1,'2022-03-22 17:35:00',4,12.75,'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',1,'2022-02-26 18:12:40.048998','2022-04-26 12:33:51.000000','Pasta Bolognese met tomaat, spekjes en kaas','Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!','gluten,lactose'),
(2,1,1,0,0,'2022-05-22 13:35:00',4,12.75,'https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-04-25 12:56:05.000000','Aubergine uit de oven met feta, muntrijst en tomatensaus','Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.','noten'),
(3,1,0,0,1,'2022-05-22 17:30:00',4,10.75,'https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-03-15 14:10:19.000000','Spaghetti met tapenadekip uit de oven en frisse salade','Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.','gluten,lactose'),
(4,1,0,0,0,'2022-03-26 21:22:26',4,4.00,'https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg',3,'2022-03-06 21:23:45.419085','2022-03-12 19:51:57.000000','Zuurkool met spekjes','Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ',''),
(5,1,1,0,1,'2022-03-26 21:24:46',6,6.75,'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',3,'2022-03-06 21:26:33.048938','2022-03-12 19:50:13.000000','Groentenschotel uit de oven','Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.','');`

const INSERT_PARTICIPANTS = `INSERT INTO \`meal_participants_user\` VALUES (1,2),(1,3),(1,5),(2,4),(3,3),(3,4),(4,2),(5,4);`

describe('UC-302 Wijzigen van maaltijdgegevens', () => {
    beforeEach((done) => {
        logger.debug('beforeEach called')
        database.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                CLEAR_DB + INSERT_USERS + INSERT_MEALS + INSERT_PARTICIPANTS,
                function (error, results, fields) {
                    connection.release()
                    if (error) throw error
                    logger.debug('beforeEach done')
                    done()
                }
            )
        })
    })

    it(`TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken `, (done) => {
        chai.request(server)
            .put(`${endpointToTest}/1`)
            .set(
                'Authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
            )
            .send({
                description: 'Past with saus',
                isActive: true,
                isVegan: false,
                isToTakeHome: true,
                dateTime: '2023-04-06T10:27:16.849Z',
                imageUrl:
                    'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                allergenes: ['gluten', 'lactose']
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.an('object')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.an('object').that.is.empty
                done()
            })
    })

    it('TC-302-2 Niet ingelogd', (done) => {
        chai.request(server)
            .put(`${endpointToTest}/1`)
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Authorization header missing!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.an('object').that.is.empty
                done()
            })
    })

    it('TC-302-3 Niet de eigenaar van de data', (done) => {
        const token = jwt.sign({ userId: 2 }, jwtSecretKey)

        chai.request(server)
            .put(`${endpointToTest}/1`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Pasta 2',
                description: 'Past with saus',
                price: 12,
                isActive: true,
                isVegan: false,
                isVega: true,
                isToTakeHome: true,
                dateTime: '2023-04-06T10:27:16.849Z',
                maxAmountOfParticipants: 12,
                imageUrl:
                    'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                allergenes: ['gluten', 'lactose']
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res.body).to.be.a('object')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-302-4 Maaltijd bestaat niet', (done) => {
        chai.request(server)
            .put(`${endpointToTest}/7`)
            .set(
                'Authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
            )
            .send({
                name: 'Pasta 2',
                description: 'Past with saus',
                price: 12,
                isActive: true,
                isVegan: false,
                isVega: true,
                isToTakeHome: true,
                dateTime: '2023-04-06T10:27:16.849Z',
                maxAmountOfParticipants: 12,
                imageUrl:
                    'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                allergenes: ['gluten', 'lactose']
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.an('object')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.an('object').that.is.empty
                done()
            })
    })

    it('TC-305-5 Maaltijd succesvol gewijzigd', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey)

        chai.request(server)
            .put(`${endpointToTest}/1`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Pasta',
                description: 'Beatuiful pasta made with fresh tomato sauce',
                price: 25.0,
                isActive: 1,
                isVegan: 0,
                isToTakeHome: 1,
                dateTime: '2021-12-31 23:59:59',
                maxAmountOfParticipants: 10,
                imageUrl:
                    'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                allergenes: ['gluten', 'lactose']
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.an('object')

                chai.expect(res.body).to.have.property('message')
                chai.expect(res.body)
                    .to.have.property('message')
                    .that.is.a('string')

                done()
            })
    })
})
