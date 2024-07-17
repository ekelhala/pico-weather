import { Button, Card, Col, Container, Navbar, OverlayTrigger, Row, Stack, Tab, Tabs, Tooltip } from "react-bootstrap";
import DataCard from "./DataCard";
import { BsArrowCounterclockwise, BsAt, BsCpu, BsGeoAlt, BsGithub } from "react-icons/bs";

function DeviceTab(props) {
    return(
        <Container fluid>
        <Row className="my-2">
        <Col>
        <Card>
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
          {props.deviceInfo.map(info => {
            return(
              <Col key={info.topic}>
                <DataCard key={info.topic}
                    topic={info.topic}
                    dataName={props.topics[info.topic].name}
                    value={info.value + (props.units[info.unit])}
                    info={props.topics[info.topic].info}
                    extraInfo={info.extraInfo}/>                
              </Col>
            )
          })}
          </Row>    
        </Container>
    )
}
export default DeviceTab;