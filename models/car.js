const mongoose = require('mongoose')

const carSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectID,
    carType: {type: String, required: true},
    maxPassengers: {type: Number, required: true},
    available: {type: Boolean, required: true}
})

module.exports = mongoose.model('Car', carSchema)