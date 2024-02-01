const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

const Reservation = require('./models/reservation')
const Car = require('./models/car')
const checkAuth = require('./middleware/auth') // importing checkAuth when applied to certain requests they will require a valid token

// GET Request
router.get('/', checkAuth, (req, res, next) => {
    Reservation.find()
    .select('car dropofLocation pickupLocation _id')
    .populate('car', 'carType')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            reservations: docs.map(doc => {
                return {
                    _id: doc._id,
                    car: doc.car,
                    dropofLocation: doc.dropofLocation,
                    pickupLocation: doc.pickupLocation,
                    reservationInformation: {
                        type: 'GET',
                        description: 'Fetch the detailed information of this particular reservation',
                        url: 'http://localhost:3000/reservations/' + doc._id
                    }
                }
            }),
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});


// POST Request
router.post('/', checkAuth, (req, res, next) => {
    Car.findById(req.body.carId)
        .then(car => {
            if (!car) {
                return res.status(404).json({
                    message: "Car does not exist"
                });
            } else {
                const reservationdetails = new Reservation({
                    _id: new mongoose.Types.ObjectId(),
                    car: req.body.carId,
                    dropofLocation: req.body.dropofLocation,
                    pickupLocation: req.body.pickupLocation
                });

                reservationdetails.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'Created a new reservation',
                            createdReservation: {
                                _id: result._id,
                                car: result.car,
                                dropofLocation: result.dropofLocation,
                                pickupLocation: result.pickupLocation,
                                reservationInformation: {
                                    type: 'GET',
                                    description: 'Fetch the detailed information of this particular reservation',
                                    url: 'http://localhost:3000/reservations/' + result._id
                                }
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


// GET Request for particular reservation
router.get('/:reservationId', checkAuth, (req, res, next) => {
    Reservation.findById(req.params.reservationId)
    .select('car dropofLocation pickupLocation _id')
    .populate('car')
    .exec()
    .then(reservation => {
        if (reservation) {
            res.status(200).json({
                reservation: reservation
            })
        } else {
            res.status(404).json({message: 'No reservation found with this ID'})
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});


// PATCH Request for particular reservation
router.patch('/:reservationId', checkAuth, (req, res, next) => {
    const id = req.params.reservationId
    const updateFields = {
        car: req.body.car,
        dropofLocation: req.body.dropofLocation,
        pickupLocation: req.body.pickupLocation
    }
    Reservation.findByIdAndUpdate(id, updateFields, { new: true })
    .then(updatedReservation => {
        if (updatedReservation) {
            res.status(200).json({
                message: "Reservation details updated successfully",
                carInformation: {
                    type: 'GET',
                    description: 'Fetch the detailed information of this newly updated reservation',
                    url: 'http://localhost:3000/reservation/' + id
                }
            })
        } else {
            res.status(500).json({
                message: "Reservation not found"
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});


// DELETE Request for particular reservation
router.delete('/:reservationId', checkAuth, (req, res, next) => {
    const id = req.params.reservationId
    Reservation.deleteOne({_id: id})
    .exec()
    .then(result => {
        if (result.deletedCount > 0) {
            res.status(200).json(
                { message: 'Reservation cancelled successfully' 
            })
        } else {
            res.status(404).json(
                { message: 'No valid reservation found' 
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