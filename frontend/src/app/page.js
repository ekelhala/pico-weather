'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Container, Navbar, Tab, Tabs, Toast } from "react-bootstrap";
import { BsArrowCounterclockwise } from "react-icons/bs";
import WeatherTab from "./components/WeatherTab";
import DeviceTab from "./components/DeviceTab";

export default function Home() {

  const API_URL = (process.env.NODE_ENV==='production' ? '/api' : 'http://localhost:8000/api')

  const [data, setData] = useState({data:[]})
  const [historyData, setHistoryData] = useState({
    temperatureHistory: null,
    humidityHistory: null
  })
  
  const [deviceInfo, setDeviceInfo] = useState([]);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);

  const TOPICS = {'device/temperature': {
                    name: 'System temperature',
                    info: 'This is a rough measurement taken from the onboard temperature sensor of Pico'
                  },
                  'sensors/temperature_out': {
                    name: 'Temperature',
                    info: 'A fairly accurate measurement of outside temperature. Note that if the temperature sensor is in direct sunlight, this value might be higher than expected.'
                  },
                  'sensors/humidity': {
                    name: 'Humidity',
                    info: 'Relative humidity represents the actual amount of water vapor in the air compared to the amount that can exist in the air in current temperature.'
                  },
                  'sensors/illuminance': {
                    name: 'Illuminance',
                    info: 'Direct sunlight is approximately 100 000 lux, while overcast day is 1000'
                  },
                  'sensors/uv_index': {
                    name: 'UV index',
                    info: ''
                  }};
  
  const units = {
    celsius: "\u00b0C",
    lux: " lux",
    none: "",
    percent: "%"
  }

  useEffect(() => {
    const getStartData = async () => {
      await getData('sensors/all')
      await getDeviceData();
      await getHistoryData();
    }
    getStartData();
  },[])

  const getData = async (uri) => {
    const freshData = (await axios.get(`${API_URL}/${uri}`)).data;
    setData(freshData);
  }

  const getDeviceData = async () => {
      const deviceData = (await axios.get(`${API_URL}/device/temperature`)).data;
      // Remember to change here if there is more device data in the future!
      setDeviceInfo([deviceData]);
  }

  const getHistoryData = async () => {
    const temperatureData = (await axios.get(`${API_URL}/history/temperature`)).data;
    const humidityData = (await axios.get(`${API_URL}/history/humidity`)).data;
    setHistoryData({
      temperatureHistory: [{
        name: 'Temperature',
        data: temperatureData
      }],
      humidityHistory: [{
        name: 'Humidity',
        data: humidityData
      }]
    })
  }

  const updateAll = async () => {
    await getData('sensors/all');
    await getDeviceData();
    await getHistoryData();
    setShowUpdatedToast(true);
  }

  return (
    <>
      <Navbar sticky="top" bg="dark" variant="dark"
      className="bg-body-tertiary mx-auto mb-2">
        <Container fluid>
          <div style={{display: "flex", width: "100%", justifyContent:"space-between"}}>
            <Navbar.Brand>Dashboard</Navbar.Brand>
            <Button variant="outline" style={{borderRadius:'15px'}} onClick={async () => updateAll()}>
              <BsArrowCounterclockwise size="1.2em"/>
            </Button>
          </div>
        </Container>
      </Navbar>
      <Tabs defaultActiveKey="weather" className="mb-3" justify style={{position: 'sticky'}}>
        <Tab eventKey="weather" title="Weather">
          <WeatherTab topics={TOPICS} units={units} data={data} temperatureHistory={historyData.temperatureHistory}
            humidityHistory={historyData.humidityHistory}/>
        </Tab>
        <Tab eventKey="device" title="Device">
          <DeviceTab topics={TOPICS} units={units} deviceInfo={deviceInfo}/>
        </Tab>
      </Tabs>
      <Toast autohide delay={2000} show={showUpdatedToast}
        onClose={() => setShowUpdatedToast(false)} style={{position: 'fixed', bottom:'5px', left: '5px'}}>
        <Toast.Body>Data updated!</Toast.Body>
      </Toast>
    </>
  );
}
