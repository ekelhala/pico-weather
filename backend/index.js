const MQTT = require('mqtt');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.port || 8000;

const UNIT_CELSIUS = "celsius"

const dataModel = [
    {
        topic: "device/temperature",
        value: -1,
        unit: UNIT_CELSIUS,
        lastUpdated: Date.now()
    },
    {
        topic: "sensors/temperature_out",
        value: -1,
        unit: UNIT_CELSIUS,
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

app.get("*", (req, res) => {
    const topicURI = req.url.slice(1);
    let found = false;
    dataModel.forEach(data => {
        if(data.topic == topicURI) {
            res.json(serializeData(data));
            found = true;
        }
    })
    if(!found) {
        res.status(404).json({error: "Data not found"});
    }
})

const serializeData = (data) => {
    let dataInst = structuredClone(data);
    delete dataInst.topic
    return dataInst;
}

app.listen(PORT, () => {
    console.log("Server running in port %d", PORT);
})