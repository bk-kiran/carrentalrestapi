const mongoose = require('mongoose')

const reservationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectID,
    car: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Car',
        required: true
    },
    dropofLocation: {type: String, required: true},
    pickupLocation: {type: String, required: true}
})

module.exports = mongoose.model('Reservation', reservationSchema)