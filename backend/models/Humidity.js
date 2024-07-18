const mongoose = require('mongoose');

const Humidity = mongoose.Schema({
    timestamp: Date,
    value: Number
},
{
toJSON: {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
}
});

module.exports = mongoose.model('Humidity', Humidity);