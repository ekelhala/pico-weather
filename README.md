# pico-weather

A weather station for Pico W. It uses MQTT to send sensor data from the Pico to a server, which processes and distributes it via an API. The data can be viewed directly through the backend API, or graphically by using the provided frontend application.

**To do**

- Establish connection with server ✅
- Collect sensor data periodically ✅ (only one source currently)
- Send data to server ✅
- Display data in a web page, formatted appropriately ✅
- Improve documentation
- Dockerize

## Project structure

* `pico` - contains the weather station software for Pico W
* `backend` - contains the backend Express server
* `frontend` - contains the React applicationto view data

## Usage

Right now the different components need to be deployed separately. You also need an MQTT Broker, to which the backend service and Pico connect to exchange data.