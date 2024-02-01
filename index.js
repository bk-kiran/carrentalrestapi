const express = require('express');
const app = express();
const PORT = 3000;
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose= require('mongoose')

const carsRouter = require('./cars'); 
const reservationsRouter = require('./reservations')
const userRouter = require('./user')

mongoose.connect('mongodb+srv://' + process.env.MONGO_ATLAS_PW + '@car-rent-api.e8mel7v.mongodb.net/') 

app.listen(
    PORT,
    () => console.log(`Hello World at http://localhost:${PORT}`)
);


app.use(express.json());

// using the morgan package to log all requests in the terminal
app.use(morgan('dev'))


// using the body-parser package to extract the body from a POST request
app.use(bodyParser.urlencoded({extended: false})) // URL format
app.use(bodyParser.json()) // JSON format


// handling/preventing CORS errors in order to protect the API from unwanted access from other web pages
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

// Uses the carsRouter middleware for handling requests related to cars
app.use('/cars', carsRouter);


// Uses the reservationsRouter middleware for handling requests related to reservations
app.use('/reservations', reservationsRouter);

// Uses the authRouter middleware for handling requests related to authentication
app.use('/user', userRouter);


// Error Handling for unknown requests
app.use((req, res, next) => {
    const error = new Error(`Request Not Found`)
    error.status = 404
    next(error)
});


// Error Handling for known errors
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})


