const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

const checkAuth = require('./middleware/auth') // importing checkAuth when applied to certain requests they will require a valid token
const Car = require('./models/car')



// GET Request for only available cars
router.get('/available', (req, res, next) => {
    Car.find({ available: true })
    .select('carType maxPassengers _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            cars: docs.map(doc => {
                return {
                    _id: doc._id,
                    carType: doc.carType,
                    maxPassengers: doc.maxPassengers,
                    carInformation: {
                        type: 'GET',
                        description: 'Fetch the detailed information of this particular car',
                        url: 'http://localhost:3000/cars/' + doc._id
                    }
                }
            })
        }
        if (docs.length >= 0) {
            res.status(200).json(response)
        } else {
            res.status(404).json({
                message: 'No cars available at this time'
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
});




// GET Request for all cars regardless of availability
router.get('/', checkAuth, (req, res, next) => {  
    Car.find()
    .select('carType maxPassengers available _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            cars: docs.map(doc => {
                return {
                    _id: doc._id,
                    carType: doc.carType,
                    maxPassengers: doc.maxPassengers,
                    available: doc.available,
                    carInformation: {
                        type: 'GET',
                        description: 'Fetch the detailed information of this particular car',
                        url: 'http://localhost:3000/cars/' + doc._id
                    }
                }
            })
        }
        if (docs.length >= 0) {
            res.status(200).json(response)
        } else {
            res.status(404).json({
                message: 'No cars available at this time'
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
});



// POST Request
router.post('/', checkAuth, (req, res, next) => {
    const car = new Car({
        _id: new mongoose.Types.ObjectId(), 
        carType: req.body.carType,
        maxPassengers: req.body.maxPassengers,
        available: req.body.available

    })
    car
    .save()
    .then(result => {
        console.log(result)
        res.status(201).send({
            message: 'Added a new car to the fleet',
            addedCar: {
                _id: result._id,
                carType: result.carType,
                maxPassengers: result.maxPassengers,
                available: result.available,
                carInformation: {
                    type: 'GET',
                    description: 'Fetch the detailed information of this newly added car',
                    url: 'http://localhost:3000/cars/' + result._id
                }
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
    
})



// GET Request for particular car
router.get('/:carId', (req, res, next) => {
    const id = req.params.carId
    Car.findById(id)
    .select('carType maxPassengers available _id')
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json({
                car: doc,
                allCars: {
                    type: 'GET',
                    description: 'Fetch all cars in the fleet',
                    url: 'http://localhost:3000/cars/' 
                },
                availableCars: {
                    type: 'GET',
                    description: 'Fetch all cars in the fleet that are currently available',
                    url: 'http://localhost:3000/cars/available' 
                }
            })
        } else {
            res.status(404).json({message: 'No valid entry of car found with this ID'})
        }
        
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    })

})



// PATCH Request for particular car
router.patch('/:carId', checkAuth, (req, res, next) => {
    const id = req.params.carId
    const updateFields = {
        carType: req.body.carType,
        maxPassengers: req.body.maxPassengers,
        available: req.body.available
    }
    Car.findByIdAndUpdate(id, updateFields, { new: true })
    .then(updatedCar => {
        if (updatedCar) {
            res.status(200).json({
                message: "Car details updated successfully",
                carInformation: {
                    type: 'GET',
                    description: 'Fetch the detailed information of this newly updated car',
                    url: 'http://localhost:3000/cars/' + id
                }
            })
        } else {
            res.status(500).json({
                message: "Car not found"
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })

})



// DELETE Request for particular car
router.delete('/:carId', checkAuth, (req, res, next) => {
    const id = req.params.carId
    Car.deleteOne({_id: id})
    .exec()
    .then(result => {
        if (result.deletedCount > 0) {
            res.status(200).json(
                { message: 'Car deleted successfully from the fleet' 
            })
        } else {
            res.status(404).json(
                { message: 'No valid entry of car found with this ID' 
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
});



module.exports = router;