"use client"
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardBody } from 'react-bootstrap';

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

function GraphCard(props) {

    const chartOptions = {
        chart: {
            type: 'area',
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            },
        },
        xaxis: {
            type: 'datetime',
            lines: {
            show: true
            },
            labels: {
            show: true,
            style: {
                colors: '#ffffff'
            },
            datetimeUTC: false
        }
        },
        yaxis: {
            opposite: 'true',
            title: {
                text: props.unit,
                rotate: 0,
                offsetX: -2,
                style: {
                    color: '#ffffff'
                }
            },
            labels: {
                show: true,
                style: {
                    colors: '#ffffff'
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        tooltip: {
            enabled: false
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
                    {props.history?<ApexChart width={"100%"} height={200} options={chartOptions} series={props.history} type={'area'}/>:null}
                    </div>
            </CardBody>
        </Card>
    )
}

export default GraphCard;