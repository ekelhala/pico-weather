const { Card, CardHeader, CardTitle, CardBody, Accordion, CardFooter } = require("react-bootstrap");

function IlluminanceCard(props)  {

    return(
        <Card data-bs-theme="dark">
            <CardHeader>{props.dataName}</CardHeader>
            <CardBody>
                <CardTitle><b>{props.extraInfo[0]}</b></CardTitle>
                    <div>
                    <small className="text-muted">
                        Measured lux value: {props.value}
                    </small>
                    </div>
            </CardBody>
        </Card>
    )
}
export default IlluminanceCard;