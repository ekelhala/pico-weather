'use client'
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import DataCard from "./components/DataCard";
import { Button, Card, Col, Container, Navbar, OverlayTrigger, Row, Stack, Tab, Tabs, Tooltip } from "react-bootstrap";
import { BsArrowCounterclockwise, BsAt, BsCpu, BsGeoAlt, BsGithub } from "react-icons/bs";

export default function Home() {

  const API_URL = (process.env.NODE_ENV==='production' ? '/api' : 'http://localhost:8000/api')

  const [data, setData] = useState({data:[]})
  const [deviceInfo, setDeviceInfo] = useState([]);

  const TOPICS = {'device/temperature': {
                    name: 'System temperature',
                    info: 'This is a rough measurement taken from the onboard temperature sensor of Pico'
                  },
                  'sensors/temperature_out': {
                    name: 'Temperature',
                    info: 'A fairly accurate measurement of the outside temperature'
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

  const dateFormat = {
    day:"numeric",
    year:"numeric",
    month:"numeric",
    hour:"numeric",
    minute:"numeric",
    second:"numeric"
}

  useEffect(() => {
    const getStartData = async () => {
      await getData('sensors/all')
      await getDeviceData();
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

  const updateAll = async () => {
    await getData('sensors/all');
    await getDeviceData();
  }

  return (
    <>
      <Navbar sticky="top" bg="dark" variant="dark"
      className="bg-body-tertiary mb-3">
        <Container fluid>
          <div style={{display: "flex", width: "100%", justifyContent:"space-between"}}>
            <Navbar.Brand>Dashboard</Navbar.Brand>
            <Button variant="outline-light" style={{borderRadius:'15px'}} onClick={async () => updateAll()}>
              <BsArrowCounterclockwise size="1.2em"/>
            </Button>
          </div>
        </Container>
      </Navbar>
      <Tabs defaultActiveKey="weather" className="mb-3" justify>
        <Tab eventKey="weather" title="Weather">
          <Container fluid>
            <Row className="my-2">
              <div className="d-flex justify-content-center">
                <p>Updated: {new Date(data.lastUpdated).toLocaleString(dateFormat)}</p>              
              </div>
            </Row>
            <Row xs={1} md={2} lg={2} className="g-4">
            {data.data.map(dataItem => {
              return(
                <Col key={dataItem.topic}> 
                  <DataCard key={dataItem.topic}
                      topic={dataItem.topic}
                      dataName={TOPICS[dataItem.topic].name}
                      value={dataItem.value + (units[dataItem.unit])}
                      info={TOPICS[dataItem.topic].info}
                      extraInfo={dataItem.extraInfo}
                    />
                </Col>
              )
            })}
            </Row>
            <Row className="my-3">
              <Stack direction="horizontal" gap={1} style={{marginLeft:'5px'}}><BsGithub size="1.2em"/> Check it out on <a href="https://github.com/ekelhala/pico-weather" target="_blank">Github</a>!</Stack>
            </Row>
          </Container>
        </Tab>
        <Tab eventKey="device" title="Device">
          <Container fluid>
          <Row className="my-2">
          <Col>
          <Card>
            <Card.Header>This Station</Card.Header>
              <Card.Body>
                <ul style={{listStyle:'none', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <li>
                    <Stack gap={2} direction="horizontal">
                      <BsGeoAlt size="1.2em"/> 
                       {process.env.NEXT_PUBLIC_STATION_LOCATION ? process.env.NEXT_PUBLIC_STATION_LOCATION : "Not specified"}
                    </Stack>
                  </li>
                  <li>
                    <Stack gap={2} direction="horizontal">
                      <BsCpu size="1.2em"/> 
                       {process.env.NEXT_PUBLIC_STATION_HARDWARE ? process.env.NEXT_PUBLIC_STATION_HARDWARE : "Not specified"}
                    </Stack>
                  </li>
                  <li>
                    <Stack gap={2} direction="horizontal">
                        <BsAt size="1.2em"/>
                       {process.env.NEXT_PUBLIC_STATION_CONTACT ? process.env.NEXT_PUBLIC_STATION_CONTACT : "Not specified"}
                    </Stack>
                  </li>
                </ul>
              </Card.Body>  
            </Card>
            </Col>
            </Row>
            <Row xs={1} md={2} lg={2} className="my-2">
            {deviceInfo.map(info => {
              return(
                <Col>
                  <DataCard key={info.topic}
                      topic={info.topic}
                      dataName={TOPICS[info.topic].name}
                      value={info.value + (units[info.unit])}
                      info={TOPICS[info.topic].info}
                      extraInfo={info.extraInfo}/>                
                </Col>
              )
            })}
            </Row>    
          </Container>
        </Tab>
      </Tabs>
    </>
  );
}
