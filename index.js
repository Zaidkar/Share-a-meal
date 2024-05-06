const express = require('express')
const userRoutes = require('./src/routes/user.routes')

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
    console.log('GET /api/info')
    const info = {
        name: 'My Nodejs Express server',
        version: '0.0.2',
        description:
            'This is a simple Nodejs Express server made by Zaid Karmoudi for the course programming 4'
    }
    res.json(info)
})

// Hier komen alle routes
app.use(userRoutes)

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app
