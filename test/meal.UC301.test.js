process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '3306'
process.env.DB_USER = 'share-a-meal-user'
process.env.DB_PASSWORD = ''
process.env.DB_DATABASE = 'share-a-meal'
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

const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey

const endpointToTest = '/api/meal'

//Database queries
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('UC-301 Toevoegen maaltijd', () => {
    beforeEach((done) => {
        logger.debug('beforeEach called')
        database.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEALS,
                function (error, results, fields) {
                    connection.release()
                    if (error) throw error
                    logger.debug('beforeEach done')
                    done()
                }
            )
        })
    })

    it('TC-301-1 Verplicht veld “name” ontbreekt', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey)

        chai.request(server)
            .post(endpointToTest)
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'description',
                imageUrl: 'image url',
                dateTime: '2021-12-31 23:59:59',
                maxAmountOfParticipants: 5,
                price: 6.5,
                cookId: 1
            })
            .end((err, res) => {
                if (err) return done(err)
                res.should.have.status(400)
                res.body.should.be.a('object')
                done()
            })
    })

    it('TC-301-2 Token ongeldig / niet ingelogd', (done) => {
        const invalidToken = 'ongeldige_token'

        chai.request(server)
            .post(`${endpointToTest}`)
            .set('Authorization', `Bearer ${invalidToken}`)
            .send({
                description: 'description',
                imageUrl: 'image url',
                dateTime: '2021-12-31 23:59:59',
                maxAmountOfParticipants: 5,
                price: 6.5,
                cookId: 1
            })
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.an('object')
                res.body.should.have.property('status').equals(401)
                res.body.should.have
                    .property('message')
                    .equals('Not authorized!')
                res.body.should.have.property('data').that.is.an('object').that
                    .is.empty
                done()
            })
    })

    it('TC-301-3 Maaltijd is succesvol toegevoegd', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey)

        chai.request(server)
            .post(endpointToTest)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Pasta 2',
                description: 'Pasta with saus',
                price: 10.0,
                isActive: true,
                isVegan: false,
                isVega: true,
                isToTakeHome: true,
                dateTime: '2021-12-31 23:59:59',
                maxAmountOfParticipants: 10.0,
                imageUrl:
                    'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                allergenes: ['gluten', 'lactose']
            })
            .end((err, res) => {
                if (err) return done(err)
                res.should.have.status(201)
                res.body.should.be.a('object')
                res.body.should.have.property('status').equal(201)
                res.body.should.have.property('data').that.is.an('object').that
                    .is.not.empty

                const meal = res.body.data
                meal.should.have.property('id').that.is.a('number')
                meal.should.have.property('name').eq('Pasta 2')
                meal.should.have.property('description').eq('Pasta with saus')
                meal.should.have.property('price')
                meal.should.have.property('dateTime')
                meal.should.have.property('maxAmountOfParticipants')
                meal.should.have
                    .property('imageUrl')
                    .eq(
                        'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg'
                    )

                done()
            })
    })
})
