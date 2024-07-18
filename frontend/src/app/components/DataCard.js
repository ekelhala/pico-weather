import UVIndexCard from "./UVIndexCard";
import IlluminanceCard from "./IlluminanceCard";
import GraphCard from "./GraphCard";
import NormalCard from "./NormalCard";

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