# pico-weather

A weather station for Pico W. It uses MQTT to send sensor data from the Pico to a server, which processes and distributes it via an API. The data can be viewed directly through the backend API, or graphically by using the provided frontend application.

**To do**

- Establish connection with server ✅
- Collect sensor data periodically ✅ (only one source currently)
- Send data to server ✅
- Display data in a web page, formatted appropriately ✅ (only one source currently)
- Improve documentation
- Dockerize ✅
- Add more sensors

## Project structure

* `pico` - contains the weather station software for Pico W
* `backend` - contains the backend Express server
* `frontend` - contains the React application to view data
* `proxy` - nginx proxy to be used in deployment

## Deployment

You will need Docker, and docker-compose. The application can be deployed to a server by simply cloning this repository, entering the directory, and running `docker compose up`.

MQTT Broker is not included in the deployment, so it needs to be set up separately. [msoquitto]() is a good choice for this. The address, port and credentials for the server need to be also included to the environment variable files in `backend/.env` and `pico/config/.env.h`
