
function DeviceTemperature(props) {
    return(
    <>
        <div style={{display: 'flex', alignItems: 'center', columnGap: '10px'}}>
            <h3 id="device-temperature">Device temperature</h3>
            <button onClick={async () => await props.getData("device/temperature")}>Refresh</button>
        </div>
        {props.data ? <TemperatureDisplay data={props.data}/> :
                     <p>no data available</p>}
    </>
    )
}

function TemperatureDisplay(props) {
    const dateFormat = {
        day:"numeric",
        year:"numeric",
        month:"numeric",
        hour:"numeric",
        minute:"numeric",
        second:"numeric"
    }
    let unitLetter = '';
    if(props.data.unit === 'celsius') {
        unitLetter = 'C'
    }
    else {
        unitLetter = 'F'
    }
    return(
        <>
        <h3>{props.data.value}&deg;{unitLetter}</h3>
        <small style={{color: 'gray'}}><p>This is a rough measurement taken from the Pico's RP2040-chip,
             and it might not reflect the temperature of its surroundings well.
        </p>
        </small>
        <small>Last updated: {new Date(props.data.lastUpdated).toLocaleDateString({}, dateFormat)}</small>
        </>
    )
}

export default DeviceTemperature;