import ReactShowMoreText from "react-show-more-text";
import { Card, CardHeader, CardTitle, CardBody } from 'react-bootstrap';

function ExpandCollapseButton(props) {
    return(
        <p className="text-primary" style={{cursor:'pointer'}}>
            {props.children}
        </p>
    )
}

function NormalCard(props) {
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

export default NormalCard;