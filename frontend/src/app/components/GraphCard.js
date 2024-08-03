"use client"
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody, Dropdown } from 'react-bootstrap';
import axios from 'axios';

const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

function GraphCard(props) {

    const API_URL = (process.env.NODE_ENV==='production' ? '/api' : 'http://localhost:8000/api')

    const [timeframe, setTimeframe] = useState(0);

    const timeframes = ['24h', '7 days', '1 month']

    const [history, setHistory] = useState([])


    const DAY = 24*60*60*1000
    // millisecond values for different timeframes: 24h, 1 week, 1 month
    const times = [DAY,(7*DAY), (30*DAY)];

    useEffect(() => {
        const getData = async () => {
            await getHistoryData()
        }
        getData();
    },[timeframe])

    const getHistoryData = async () => {
        const endDate = new Date();
        const startDate = new Date(new Date().getTime() - times[timeframe]);
        const requestParams = {
          start: startDate,
          end: endDate
        }
        const data = (await axios.get(`${API_URL}/history/${props.datasetName}`, 
          {params: requestParams})).data;
        setHistory([{
            name: props.datasetName,
            data
          }])
      }

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
                <CardTitle>
                    <div className='d-flex justify-content-between align-items-center'>
                        {props.value}
                        <Dropdown onSelect={(eventKey, event) => setTimeframe(eventKey)}>
                            <Dropdown.Toggle variant='outline'>{timeframes[timeframe]}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={0}>24h</Dropdown.Item>
                                <Dropdown.Item eventKey={1}>7 days</Dropdown.Item>
                                <Dropdown.Item eventKey={2}>1 month</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </CardTitle>
                    <div>
                    {history?<ApexChart width={"100%"} height={200} options={chartOptions} series={history} type={'area'}/>:null}
                    </div>
            </CardBody>
        </Card>
    )
}

export default GraphCard;