# pico-weather

The plan is to create a weather station program for Pico W, which sends data to MQTT broker.

**Features needed**

- Establish connection with server ✅
- Collect sensor data periodically ✅ (only one source currently)
- Send data to server ✅
- Recover from errors
- Display data in a web page, formatted appropriately

## Project structure

* `pico` - contains the weather station software for Pico W
* `backend` - contains the backend Node.js server
