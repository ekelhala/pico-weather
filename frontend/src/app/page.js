'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import DataCard from "./components/DataCard";
import { Button, Card, Col, Container, Navbar, Row, Stack } from "react-bootstrap";
import { BsArrowCounterclockwise, BsAt, BsCpu, BsGeoAlt, BsGithub } from "react-icons/bs";

export default function Home() {

  const API_URL = (process.env.NODE_ENV==='production' ? '/api' : 'http://localhost:8000/api')

  const [data, setData] = useState([])

  const TOPIC_TEXTS = {
    'device/temperature': 'Device temperature'
  }

  const TOPIC_INFOS = {
    'device/temperature': 'This is a rough measurement taken from the Pico\'s RP2040-chip, and it might not reflect the temperature of its surroundings well.'
  }

  const TOPICS = ['device/temperature']
  
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
      await getData('device/temperature')
    }
    getStartData();
  },[])

  const getData = async (uri) => {
    const freshData = (await axios.get(`${API_URL}/${uri}`)).data;
    setData([freshData]);
  }

  const updateAll = async () => {
    TOPICS.forEach(async topic => {
      await getData(topic);
    })
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
      <Container fluid className="my-2">
        <Card>
          <Card.Header>This Station</Card.Header>
          <Card.Body>
            <ul style={{listStyle:'none', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <li><Stack gap={2} direction="horizontal">
                <BsGeoAlt size="1.2em"/> 
                Location: {process.env.NEXT_PUBLIC_STATION_LOCATION ? process.env.NEXT_PUBLIC_STATION_LOCATION : "Not specified"}
                </Stack></li>
              <li><Stack gap={2} direction="horizontal">
                <BsCpu size="1.2em"/> 
                Hardware: {process.env.NEXT_PUBLIC_STATION_HARDWARE ? process.env.NEXT_PUBLIC_STATION_HARDWARE : "Not specified"}
                </Stack></li>
              <li><Stack gap={2} direction="horizontal">
                <BsAt size="1.2em"/>
                Contact: {process.env.NEXT_PUBLIC_STATION_CONTACT ? process.env.NEXT_PUBLIC_STATION_CONTACT : "Not specified"}
                </Stack></li>
            </ul>
          </Card.Body>  
        </Card>    
      </Container>
      <Container fluid>
      <Row xs={1} md={2} lg={2}>
      {data.map(dataItem => {
        return(
        <Col key={dataItem.topic}> 
        <DataCard
                dataName={TOPIC_TEXTS[dataItem.topic]}
                value={dataItem.value + '\u00b0' + (dataItem.unit==='celsius'? 'C' : 'F')}
                info={TOPIC_INFOS[dataItem.topic]}
                date={new Date(dataItem.lastUpdated).toLocaleDateString({}, dateFormat)}
                />
          </Col>
          )
      })}
      </Row>
      </Container>
      <footer style={{position: 'absolute', bottom:'0'}}>
      <Stack direction="horizontal" gap={1} style={{marginLeft:'5px'}}><BsGithub size="1.2em"/> Check it out on <a href="https://github.com/ekelhala/pico-weather" target="_blank">Github</a>!</Stack>
      </footer>
    </>
  );
}
