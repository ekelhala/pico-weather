import ReactShowMoreText from "react-show-more-text";
import UVIndexCard from "./UVIndexCard";
import IlluminanceCard from "./IlluminanceCard";

const { Card, CardHeader, CardTitle, CardBody, Accordion, CardFooter } = require("react-bootstrap");


function ExpandCollapseButton(props) {
    return(
        <p className="text-primary" style={{cursor:'pointer'}}>
            {props.children}
        </p>
    )
}

function DataCard(props) {
    if(props.topic === 'sensors/uv_index') {
        return (
            <UVIndexCard dataName={props.dataName}
                        value={props.value}
                        extraInfo={props.extraInfo}/>
        )
    }
    else if(props.topic === 'sensors/illuminance') {
        return(
            <IlluminanceCard value={props.value} 
                            extraInfo={props.extraInfo}
                            dataName={props.dataName}/>
        )
    }
    return(
        <Card data-bs-theme="dark" style={{height: "200px"}}>
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
        </Card>
    )
}

export default DataCard;