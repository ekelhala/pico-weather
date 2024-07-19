const express = require('express');
const Temperature = require('../models/Temperature');
const Humidity = require('../models/Humidity');
const Illuminance = require('../models/Illuminance');
const UVIndex = require('../models/UVIndex');

const router = express.Router();

const uvExtraInfos = {
    low: ['Low', 'green'],
    moderate: ['Moderate', 'yellow'],
    high: ['High', 'orange'],
    veryHigh: ['Very high', 'red'],
    extreme: ['Extreme', 'violet']
}

const illuminanceExtraInfos = {
    dark: ['Dark'],
    lowLight: ['Low light'],
    overcast: ['Overcast'],
    daylight: ['Daylight'],
    bright: ['Bright']
}

const getUVExtraInfo = (uvValue) => {
    if(uvValue <= 2)
        return uvExtraInfos.low;
    else if(uvValue <= 5)
        return uvExtraInfos.moderate;    
    else if(uvValue <= 7)
        return uvExtraInfos.high;
    else if(uvValue <= 10)
        return uvExtraInfos.veryHigh;
    return uvExtraInfos.extreme;
}

const getIlluminanceExtraInfo = (illuminanceValue) => {
    if(illuminanceValue <= 500)
        return illuminanceExtraInfos.dark;
    else if(illuminanceValue <= 5380)
        return illuminanceExtraInfos.lowLight;
    else if(illuminanceValue <= 21520)
        return illuminanceExtraInfos.overcast;
    else if(illuminanceValue <= 43050)
        return illuminanceExtraInfos.daylight;
    return illuminanceExtraInfos.bright;
}

router.get('/all', async (req, res) => {
    const latestTemperature = await Temperature.findOne().sort({$natural: -1})
    const lastUpdated = latestTemperature.timestamp;
    const latestHumidity = await Humidity.findOne().sort({$natural: -1})
    let latestIlluminance = await Illuminance.findOne().sort({$natural: -1})
    let latestUVIndex = await UVIndex.findOne().sort({$natural: -1})

    latestIlluminance.extraInfo = getIlluminanceExtraInfo(latestIlluminance.value);
    latestUVIndex.extraInfo = getUVExtraInfo(latestUVIndex.value);

    res.json({
        lastUpdated,
        data: [
            latestTemperature,
            latestHumidity,
            latestIlluminance,
            latestUVIndex
        ]
    })
});

module.exports = router;