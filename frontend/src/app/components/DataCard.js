import ReactShowMoreText from "react-show-more-text";
import UVIndexCard from "./UVIndexCard";
import IlluminanceCard from "./IlluminanceCard";
import TemperatureCard from "./GraphCard";
import GraphCard from "./GraphCard";
import NormalCard from "./NormalCard";

const { Card, CardHeader, CardTitle, CardBody, Accordion, CardFooter } = require("react-bootstrap");


function DataCard(props) {
    switch(props.topic) {
        case 'sensors/uv_index':
            return(
                <UVIndexCard dataName={props.dataName}
                    value={props.value}
                    extraInfo={props.extraInfo}/>)
        case 'sensors/illuminance':
            return(
                <IlluminanceCard value={props.value} 
                    extraInfo={props.extraInfo}
                    dataName={props.dataName}/>)
        case 'sensors/temperature_out':
            return(
                <GraphCard
                value={props.value} 
                extraInfo={props.extraInfo}
                dataName={props.dataName}
                history={props.temperatureHistory}/>)
        case 'sensors/humidity':
            return(
                <GraphCard
                value={props.value} 
                extraInfo={props.extraInfo}
                dataName={props.dataName}
                history={props.humidityHistory}/>)
        default:
            return(
                <NormalCard
                    dataName={props.dataName}
                    value={props.value}
                    extraInfo={props.extraInfo}/>
            )
    }
}

export default DataCard;