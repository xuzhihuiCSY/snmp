import React, { useState } from "react";


export default function SearchPage() {
    const [ip, setIp] = useState("");
    const [mib, setMib] = useState("");
    const [version, setVersion] = useState("");
    const [oid, setOid] = useState({});
    const [ipEmpty, setIPEmpty] = useState(true);
    const [mibEmpty, setMibEmpty] = useState(true);
    const [versionEmpty, setVersionEmpty] = useState(true);
    const [device, setDevice] = useState([]);

    const IPInput = (value) => {
        if (value !== "") {
            setIp(value);
            setIPEmpty(false);
        }
    };

    const MibInput = (value) => {
        if (value !== "") {
            setMib(value);
            setMibEmpty(false);
        }
    };

    const VersionInput = (value) => {
        if (value !== "") {
            setVersion(value);
            setVersionEmpty(false);
        }
    };


    const handleIPSearch = (event) => {
        event.preventDefault();
        if (ipEmpty === false) {
            fetch("http://localhost:5000/snmp/search/ip", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ip
                })
            })
                .then(res => {
                    if (res.status === 200) {
                        return res.json()
                    } else {
                        alert("Please check your IP Address");
                        return res.json()
                    }
                })
                .then(
                    data => {
                        console.log(data);
                        setDevice([...device, data])
                    })
                .catch(error => console.error('Error:', error));
        }
    };

    const handleConnect = (event) => {
        event.preventDefault();
        if (ipEmpty === false && mibEmpty === false) {
            fetch("http://localhost:5000/snmp/add", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ip,
                    mib,
                    version
                })
            })
                .then(res => res.json())

            //search OID
            fetch("http://localhost:5000/snmp/search/device")
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    setOid(data)
                })
        }
    }

    const handleReconnect = (event) => {
        event.preventDefault();
        if (device.length !== 0) {
            fetch("http://localhost:5000/snmp/search/device")
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    setOid(data)
                })
        }
    }

    function demon(device){
        return (
            <>
                {device.map((item, key)=>{
                    return(
                        <div key={key}>
                            <p>{}</p>
                        </div>
                    )
                })}
            </>
        );
    }

    return (
        <>
            <h1>SNMP Network Device Management System</h1>
            <div>
                <div>
                    <div>
                        <input type="text" onChange={(e) => IPInput(e.target.value)} />
                        {ipEmpty ? <div style={{ color: 'red' }}>IP Address required!</div> : ''}
                    </div>
                    <div>
                        <input type="text" onChange={(e) => MibInput(e.target.value)} />
                        {mibEmpty ? <div style={{ color: 'red' }}>MIB required!</div> : ''}
                    </div>
                    <div>
                        <select defaultValue="Select a version">
                            <option value="none">Select a version</option>
                            <option>V2c</option>
                            <option>V3</option>
                        </select>
                        {versionEmpty ? <div style={{ color: 'red' }}>Select one version!</div> : ''}
                    </div>
                </div>
                <button onClick={handleIPSearch}>Search</button>
                <button onClick={handleReconnect}>Re-Connect</button>
                {device.length !== 0 ? <div>
                    <h5>Do you want to connect?</h5>
                    <button onClick={handleConnect}>connect</button>
                </div> : ''}
                {device.map((item, key) => {
                    { console.log(device)
                        console.log(device[0]._id)
                     }
                    return (
                        <div key={key}>
                            <div>{item._id}</div>
                            <div>{item.ipAddress}</div>
                            <div>{item.snmpVersion}</div>
                            <div>{item.mib}</div>
                            <div>{item.Geolocation._id}</div>
                            <div>{item.Hostname}</div>
                            <div>{item.interfaceAmount}</div>
                            {/* <h2>{device[0]._id}</h2>
                            <h2>{device[0].ipAddress}</h2>
                            <h2>{device[0].snmpVersion}</h2>
                            <h2>{device[0].mib}</h2>
                            <h2>{device[0].Geolocation._id}</h2> */}
                            {/* <h2>{device[0].Hostname}</h2> */}
                            {/* <h2>{device[0].interfaceAmount}</h2> */}
                        </div>
                    )
                })}
            </div>
        </>
    )
}
