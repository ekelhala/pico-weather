import { Button, Card, Col, Container, Navbar, OverlayTrigger, Row, Stack, Tab, Tabs, Tooltip } from "react-bootstrap";
import DataCard from "./DataCard";
import { BsGithub } from "react-icons/bs";

function WeatherTab(props) {

    const dateFormat = {
        day:"numeric",
        year:"numeric",
        month:"numeric",
        hour:"numeric",
        minute:"numeric",
        second:"numeric"
    }

    return(
        <Container fluid className="mx-auto">
        <Row className="my-2">
          <div className="d-flex justify-content-center">
            <p>Updated: {new Date(props.data.lastUpdated).toLocaleString(dateFormat)}</p>              
          </div>
        </Row>
        <Row xs={1} md={2} lg={2} className="g-4">
        {props.data.data.map(dataItem => {
          return(
            <Col key={dataItem.topic}> 
              <DataCard key={dataItem.topic}
                  topic={dataItem.topic}
                  dataName={props.topics[dataItem.topic].name}
                  value={dataItem.value + (props.units[dataItem.unit])}
                  info={props.topics[dataItem.topic].info}
                  extraInfo={dataItem.extraInfo}
                />
            </Col>
          )
        })}
        </Row>
        <Row className="my-3 mx-auto">
          <Stack direction="horizontal" gap={1} style={{marginLeft:'5px'}}><BsGithub size="1.2em"/> Check it out on <a href="https://github.com/ekelhala/pico-weather" target="_blank">Github</a>!</Stack>
        </Row>
      </Container>
    )
}
export default WeatherTab;