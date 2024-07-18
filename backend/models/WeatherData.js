const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WeatherDataSchema = new Schema({
    timestamp: Date,
    temperature: Number,
    illuminance: Number,
    humidity: Number,
    uvIndex: Number
});

module.exports = mongoose.model('WeatherData', WeatherDataSchema);