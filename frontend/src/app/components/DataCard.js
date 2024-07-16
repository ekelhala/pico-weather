import ReactShowMoreText from "react-show-more-text";
import UVIndexCard from "./UVIndexCard";

const { Card, CardHeader, CardTitle, CardBody, Accordion, CardFooter } = require("react-bootstrap");


function ExpandCollapseButton(props) {
    return(
        <p className="text-primary" style={{cursor:'pointer'}}>
            {props.children}
        </p>
    )
}

function DataCard(props) {
    if(props.topic == 'sensors/uv_index') {
        return (
            <UVIndexCard value={props.value} date={props.date}/>
        )
    }
    return(
        <Card data-bs-theme="dark">
            <CardHeader>{props.dataName}</CardHeader>
            <CardBody>
                <CardTitle>{props.value}</CardTitle>
                    <div>
                    <small className="text-muted">
                            <ReactShowMoreText 
                                lines={1}
                                more={<ExpandCollapseButton>More</ExpandCollapseButton>}
                                less={<ExpandCollapseButton>Less</ExpandCollapseButton>}
                                expanded={false}
                                truncatedEndingComponent={"... "}>
                                    {props.info}
                            </ReactShowMoreText>
                    </small>
                    </div>
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