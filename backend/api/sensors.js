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

const TOPIC_TEMPERATURE = 'sensors/temperature'
const TOPIC_HUMIDITY = 'sensors/humidity'
const TOPIC_UVI = 'sensors/uv_index'
const TOPIC_ILLUMINANCE = 'sensors/illuminance'

const UNIT_CELSIUS = "celsius"
const UNIT_PERCENT = "percent"
const UNIT_NONE = "none"
const UNIT_LUX = "lux"

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
    const latestIlluminance = await Illuminance.findOne().sort({$natural: -1})
    const latestUVIndex = await UVIndex.findOne().sort({$natural: -1})

    res.json({
        lastUpdated,
        data: [
            {
                topic: TOPIC_TEMPERATURE,
                unit: UNIT_CELSIUS,
                value: latestTemperature.value,
                extraInfo: []
            },
            {
                topic: TOPIC_ILLUMINANCE,
                unit: UNIT_LUX,
                value: latestIlluminance.value,
                extraInfo: getIlluminanceExtraInfo(latestIlluminance.value)
            },
            {
                topic: TOPIC_HUMIDITY,
                unit: UNIT_PERCENT,
                value: latestHumidity.value,
                extraInfo: []
            },
            {
                topic: TOPIC_UVI,
                unit: UNIT_NONE,
                value: latestUVIndex.value,
                extraInfo: getUVExtraInfo(latestUVIndex.value)
            }
        ]
    })
});


module.exports = router;