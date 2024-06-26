const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const mealRoutes = require('./src/routes/meal.routes')
const authRoutes = require('./src/routes/authentication.routes').routes
const participantsRoutes = require('./src/routes/participation.routes')
const logger = require('./src/util/logger')

const app = express()

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())

const port = process.env.PORT || 3000

app.all('*', (req, res, next) => {
    console.log('Request:', req.method, req.url)
    next()
})

app.get('/', function (req, res) {
    res.json({
        message:
            'Hello World! welcome to the share a meal API made by Zaid Karmoudi'
    })
})

app.get('/api/info', (req, res) => {
    logger.info('GET /api/info')
    const info = {
        name: 'Share a meal Restful API',
        studentName: 'Zaid Karmoudi',
        studentNumber: '2102960',
        version: '1.0.0',
        description:
            'This is an Restful API for the Share a meal application made by Zaid Karmoudi.'
    }
    res.json(info)
})

// Hier komen alle routes
app.use(userRoutes)
app.use(authRoutes)
app.use(mealRoutes)
app.use(participantsRoutes)

// Hier komt de route error handler te staan!
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
})

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    })
})

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app
