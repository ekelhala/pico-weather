'use client'
import { useEffect, useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
export default function Home() {

  const SERVER_URL = "http://localhost:8000"

  const [data, setData] = useState({
    deviceTemperature: {
      value: null,
      lastUpdated: null,
      unit: null
    }
  })
  
  useEffect(() => {
    const getData = async () => {
      const deviceTempData = (await axios.get(`${SERVER_URL}/device/temperature`)).data;
      setData({deviceTemperature: deviceTempData})
    }
    getData();
  },[])

  return (
    <>
      <h2>pico-weather</h2>
      <p>Data</p>
      <ul>
        <li><a href="#device-temperature">Device temperature</a></li>
      </ul>
      <h3 id="device-temperature">Device temperature</h3>
      <p>{data.deviceTemperature.value === null ? "no data available" : `${data.deviceTemperature.value}\u00b0C` }</p>
    </>
  );
}
