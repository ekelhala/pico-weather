const { Card, CardHeader, CardTitle, CardBody, Accordion, CardFooter } = require("react-bootstrap");

function UVIndexCard(props) {
    // This could probably be done cleaner...
    let rating = "";
    if(props.value <= 2)
        rating = "Low"
    else if(props.value <= 5)
        rating = "Moderate"
    else if(props.value <= 7)
        rating = "High"
    else if(props.value <= 10)
        rating = "Very high"
    else
        rating = "Extreme"
    return(
        <Card data-bs-theme="dark">
        <CardHeader>UV index</CardHeader>
        <CardBody>
            <CardTitle>{props.value}</CardTitle>
                <div>
                <small className="text-muted">
                    Risk level: <b>{rating}</b>
                </small>
                </div>
        </CardBody>
        <CardFooter className="text-muted">
            <small>
                Updated: {props.date}
            </small>
        </CardFooter>
    </Card>
    );
}
export default UVIndexCard;