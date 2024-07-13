'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import DataCard from "./components/DataCard";
import { Button, Col, Container, Navbar, Row } from "react-bootstrap";
import { BsArrowCounterclockwise } from "react-icons/bs";

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
            <Button variant="outline-light" onClick={async () => updateAll()}>
              <BsArrowCounterclockwise size="1.2em"/>
            </Button>
          </div>
        </Container>
      </Navbar>
      <Container fluid>
      <Row xs={2} md={2} lg={2}>
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
      <small>Check it out on <a href="https://github.com/ekelhala/pico-weather">Github</a>!</small>
      </footer>
    </>
  );
}
