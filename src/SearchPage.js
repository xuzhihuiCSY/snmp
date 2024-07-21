import React, { useState, useEffect } from "react";


export default function SearchPage() {
    const [ip, setIp] = useState("");
    const [mib, setMib] = useState("");
    const [version, setVersion] = useState("");
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
                if(res.status === 200){
                    return res.json()
                  }else{
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
                        <select>
                            <option>V2c</option>
                            <option>V3</option>
                        </select>
                        {versionEmpty ? <div style={{ color: 'red' }}>Select one version!</div> : ''}
                    </div>
                </div>
                <button onClick={handleIPSearch}>Search</button>
                <div>
                    {console.log(device)}
                    {device.map((item) => {
                        return (
                            <div>
                                <div key={item._id}>{item.ipAddress}</div>
                                <div key={item._id}>{item.snmpVersion}</div>
                                <div key={item._id}>{item.mib}</div>
                                <div key={item._id}>{item.Geolocation}</div>
                                <div key={item._id}>{item.Hostname}</div>
                                <div key={item._id}>{item.interfaceAmount}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}


// const getDevice = () => {
//     fetch("http://localhost:5000/snmp/search/ip", {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ ip })
//     })
//         .then(res => res.json())
//         .then(data => {
//             console.log(data)
//         })
// };

// useEffect(() => {
//     getDevice();
// }, [device]);