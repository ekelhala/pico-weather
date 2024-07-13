const { Card, CardHeader, CardTitle, CardBody, Accordion, CardFooter } = require("react-bootstrap");


function DataCard(props) {
    return(
        <Card data-bs-theme="dark">
            <CardHeader>{props.dataName}</CardHeader>
            <CardBody>
                <CardTitle>{props.value}</CardTitle>
                <Accordion defaultActiveKey={null}>
                    <Accordion.Item>
                        <Accordion.Header>Info</Accordion.Header>
                        <Accordion.Body className="text-muted">
                            <small>{props.info}</small>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </CardBody>
            <CardFooter className="text-muted">
                <small>
                    Updated: {props.date}
                </small>
            </CardFooter>
        </Card>
    )
}

export default DataCard;