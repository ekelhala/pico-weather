const MQTT = require('mqtt');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.port || 8000;

app.use(cors({origin:'*'}))

try {
    await mongoose.connect(process.env.MONGODB_URI);
}
catch(error) {
    console.log('MongoDB connection failed');
}
console.log('Connected to MongoDB');

const UNIT_CELSIUS = "celsius"
const UNIT_PERCENT = "percent"
const UNIT_NONE = "none"
const UNIT_LUX = "lux"

const state = {
    lastUpdated: Date.now(),
    data: [
    {
        topic: "sensors/temperature_out",
        value: -1,
        unit: UNIT_CELSIUS,
        extraInfo: []
    },
    {
        topic: "sensors/humidity",
        value: -1,
        unit: UNIT_PERCENT,
        extraInfo: []
    },
    {
        topic: "sensors/uv_index",
        value: 0,
        unit: UNIT_NONE,
        extraInfo: []
    },
    {
        topic: "sensors/illuminance",
        value: 0,
        unit: UNIT_LUX,
        extraInfo: []
    },
    {
        topic: "device/temperature",
        value: -1,
        unit: UNIT_CELSIUS,
        extraInfo: []
    }]
}

const mqttOptions = {
    host: process.env.MQTT_BROKER_ADDR,
    port: process.env.MQTT_BROKER_PORT,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
}

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

const mqttClient = MQTT.connect(mqttOptions);
mqttClient.on("connect", () => {
    console.log("Connected to broker!");
    console.log("Subscribing to %d topics", state.data.length);
    for(let dataIdx in state.data) {
        mqttClient.subscribe(state.data[dataIdx].topic);
    }
})
mqttClient.on("message", (topic, payload, packet) => {
    for(let dataIdx in state.data) {
        let dataItem = state.data[dataIdx];
        if(dataItem.topic === topic) {
            dataItem.value = payload.toString();
            state.lastUpdated = Date.now();
            if(dataItem.topic === 'sensors/uv_index') {
                dataItem.extraInfo = getUVExtraInfo(dataItem.value)
            }
            else if(dataItem.topic === 'sensors/illuminance') {
                dataItem.extraInfo = getIlluminanceExtraInfo(dataItem.value);
            }
        }
    }
})

app.get("/api/all", (req, res) =>  {
    res.json(state);
})

app.get("/api/sensors/all", (req, res) => {
    let ret = {
        lastUpdated: state.lastUpdated,
        data:[]
    }
    state.data.forEach(data => {
        if(data.topic.startsWith("sensors"))
            ret.data.push(data)
    })
    res.json(ret);
})

app.get("/api/*", (req, res) => {
    const topicURI = req.url.slice(5);
    let found = false;
    state.data.forEach(data => {
        if(data.topic == topicURI) {
            res.json(data);
            found = true;
        }
    })
    if(!found) {
        res.status(404).json({error: "Data not found"});
    }
})

app.listen(PORT, () => {
    console.log("Server running in port %d", PORT);
})