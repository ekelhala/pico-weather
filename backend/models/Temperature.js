const mongoose = require('mongoose');

const TemperatureSchema = mongoose.Schema({
    timestamp: Date,
    value: Number
});

module.exports = mongoose.model('Temperature', TemperatureSchema);