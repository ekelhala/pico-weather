const MQTT = require('mqtt');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');

const Temperature = require('./models/Temperature');
const Humidity = require('./models/Humidity');
const UVIndex = require('./models/UVIndex');
const Illuminance = require('./models/Illuminance');

const api = require('./api/api');

const app = express();
const PORT = process.env.port || 8000;

app.use(cors({origin:'*'}))

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.log("MongoDB connection failed. Got message: %s", error.message);
})

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


const mqttClient = MQTT.connect(mqttOptions);
mqttClient.on("connect", () => {
    console.log("Connected to broker!");
    console.log("Subscribing to %d topics", state.data.length);
    for(let dataIdx in state.data) {
        mqttClient.subscribe(state.data[dataIdx].topic);
    }
})
mqttClient.on("message", async (topic, payload, packet) => {
    saveToDatabase(topic, payload.toString());
})

const saveToDatabase = async (topic, valueToSave) => {
    try{
        const data = {
            timestamp: new Date(),
            value: valueToSave
        }
        switch(topic) {
            case 'sensors/temperature_out':
                await new Temperature(data).save();
               break;
            case 'sensors/humidity':
                await new Humidity(data).save();
                break;
            case 'sensors/uv_index':
                await new UVIndex(data).save();
                break;
            case 'sensors/illuminance':
                await new Illuminance(data).save();
                break;
            case 'device/temperature':

                break;
        }
    }
    catch(error) {
        console.log(error.message);
    }
}

app.use('/api', api);

app.listen(PORT, () => {
    console.log("Server running in port %d", PORT);
})