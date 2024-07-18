import { Card, CardHeader, CardTitle, CardBody } from 'react-bootstrap';

import Chart from 'react-apexcharts';

function GraphCard(props) {

    const chartOptions = {
        chart: {
            type: 'area',
            height: 100,
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            },
            foreColor: '#ccc'
        },
        xaxis: {
            type: 'datetime',
              lines: {
                show: true
              }
        },
        yaxis: {
            opposite: 'true'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        fill: {
            opacity: 0.9
        },
        tooltip: {
            theme: 'dark'
        }
      };

    return(
        <Card data-bs-theme="dark" style={{height: "auto"}}>
            <CardHeader>{props.dataName}</CardHeader>
            <CardBody>
                <CardTitle>{props.value}</CardTitle>
                    <div>
                    <small className="text-muted">
                        24 hour graph
                    </small>
                    {props.history?<Chart options={chartOptions} series={props.history}/>:null}
                    </div>
            </CardBody>
        </Card>
    )
}

export default GraphCard;