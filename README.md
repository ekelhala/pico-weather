# pico-weather

The plan is to create a weather station program for Pico W, which sends data to MQTT broker.

**To do**

- Establish connection with server ✅
- Collect sensor data periodically ✅ (only one source currently)
- Send data to server ✅
- Recover from errors
- Display data in a web page, formatted appropriately
- Improve documentation
- Dockerize

## Project structure

* `pico` - contains the weather station software for Pico W
* `backend` - contains the backend Express server
