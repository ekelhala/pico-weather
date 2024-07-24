const express = require('express');
const Temperature = require('../models/Temperature');
const Humidity = require('../models/Humidity');

const router = express.Router();

const makeDBQuery = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if(startDate.getTime() > endDate.getTime()) {
        throw new Error('Start date must be before end!')
    }
    return {timestamp: {$gt: new Date(start), $lt: new Date(end)}};
}

const transformArray = (data) => {
    const out = [];
    for(let i in data) {
        out.push([data[i].timestamp, data[i].value]);
    }
    return out;
}

router.get('/temperature', async (req, res) => {
    try {
        const data = await Temperature.find(makeDBQuery(req.query.start, req.query.end));
        res.json(transformArray(data));
    }
    catch(error) {
        res.status(400).json({error: 'Bad request'})
    }
});

router.get('/humidity', async (req, res) => {
    try {
        const data = await Humidity.find(makeDBQuery(req.query.start, req.query.end));
        res.json(transformArray(data));
    }
    catch(error) {
        res.status(400).json({error: 'Bad request'})
    }
});

module.exports = router;