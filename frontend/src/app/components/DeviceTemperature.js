
function DeviceTemperature(props) {
    return(
    <>
        <div style={{display: 'flex', alignItems: 'center', columnGap: '10px'}}>
            <h3 id="device-temperature">Device temperature</h3>
            <button onClick={async () => await props.getData("device/temperature")}>Update</button>
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
        <p>{props.data.value}&deg;{unitLetter}</p>
        <p>Last updated: {new Date(props.data.lastUpdated).toLocaleDateString({}, dateFormat)}</p>
        </>
    )
}

export default DeviceTemperature;