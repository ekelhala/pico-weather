const { Card, CardHeader, CardTitle, CardBody, Accordion, CardFooter } = require("react-bootstrap");

function UVIndexCard(props) {
    return(
        <Card data-bs-theme="dark">
        <CardHeader>{props.dataName}</CardHeader>
        <CardBody>
            <CardTitle>
                UV level is <b><span style={{color: props.extraInfo[1]}}>{props.extraInfo[0]}</span></b>
            </CardTitle>
                <div>
                <small className="text-muted">
                    Measured UV index: {props.value}
                </small>
                </div>
        </CardBody>
    </Card>
    );
}
export default UVIndexCard;