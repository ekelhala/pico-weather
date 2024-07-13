'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import DeviceTemperature from "@/app/components/DeviceTemperature";

export default function Home() {

  const SERVER_URL = "http://localhost:8000"

  const [data, setData] = useState({
    deviceTemperature:{},
    outsideTemperature:{}
  })
  
  useEffect(() => {
    const getStartData = async () => {
      await getData('device/temperature')
    }
    getStartData();
  },[])

  const getData = async (uri) => {
    const freshData = (await axios.get(`${SERVER_URL}/${uri}`)).data;
    switch(uri) {
      case 'device/temperature':
        setData({...data, deviceTemperature: freshData});
        break;
    }
  }

  return (
    <>
      <h2>pico-weather</h2>
      <ul>
        <li><a href="#device-temperature">Device temperature</a></li>
      </ul>
      <DeviceTemperature data={data.deviceTemperature}
      getData={getData}/>
    </>
  );
}
