const MQTT = require('mqtt');
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.port || 8000;

app.use(cors({origin:'*'}))

const UNIT_CELSIUS = "celsius"
const UNIT_PERCENT = "percent"
const UNIT_NONE = "none"
const UNIT_LUX = "lux"

const dataModel = [
    {
        topic: "sensors/temperature_out",
        value: -1,
        unit: UNIT_CELSIUS,
        lastUpdated: Date.now()
    },
    {
        topic: "sensors/humidity",
        value: -1,
        unit: UNIT_PERCENT,
        lastUpdated: Date.now()
    },
    {
        topic: "device/temperature",
        value: -1,
        unit: UNIT_CELSIUS,
        lastUpdated: Date.now()
    },
    {
        topic: "sensors/uvi",
        value: 0,
        unit: UNIT_NONE,
        lastUpdated: Date.now()
    },
    {
        topic: "sensors/illuminance",
        value: 0,
        unit: UNIT_LUX,
        lastUpdated: Date.now()
    }
]

const mqttOptions = {
    host: process.env.MQTT_BROKER_ADDR,
    port: process.env.MQTT_BROKER_PORT,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
}

const mqttClient = MQTT.connect(mqttOptions);
mqttClient.on("connect", () => {
    console.log("Connected to broker!");
    console.log("Subscribing to %d topics", dataModel.length);
    for(let dataIdx in dataModel) {
        mqttClient.subscribe(dataModel[dataIdx].topic);
    }
})
mqttClient.on("message", (topic, payload, packet) => {
    for(let dataIdx in dataModel) {
        if(dataModel[dataIdx].topic == topic) {
            dataModel[dataIdx].value = payload.toString();
            dataModel[dataIdx].lastUpdated = Date.now();
        }
    }
})

app.get("/api/all", (req, res) =>  {
    res.json(dataModel);
})

app.get("/api/*", (req, res) => {
    const topicURI = req.url.slice(5);
    let found = false;
    dataModel.forEach(data => {
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