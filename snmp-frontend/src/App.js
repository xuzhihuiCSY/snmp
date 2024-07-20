import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [uptime, setUptime] = useState('');
  const [interfaces, setInterfaces] = useState([]);
  const [processes, setProcesses] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/snmp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip_address: ipAddress }),
    });
    const data = await response.json();
    setDeviceInfo(processData(data));
    setUptime(data.uptime);
    setInterfaces(data.interfaces.map(processInterface));
    fetchProcesses();
  };

  useEffect(() => {
    const processInterval = setInterval(() => {
      if (ipAddress) fetchProcesses();
    }, 2000);

    return () => clearInterval(processInterval);
  }, [ipAddress]);

  const fetchProcesses = async () => {
    const response = await fetch('/api/processes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip_address: ipAddress }),
    });
    if (response.ok) {
      const data = await response.json();
      setProcesses(data.processes);
    } else {
      console.error('Failed to fetch processes');
    }
  };

  const processData = (data) => {
    const processedData = { ...data };
    Object.keys(processedData).forEach(key => {
      if (typeof processedData[key] === 'string') {
        processedData[key] = getValueAfterEquals(processedData[key]);
      }
    });
    return processedData;
  };

  const processInterface = (iface) => {
    const processedIface = { ...iface };
    Object.keys(processedIface).forEach(key => {
      processedIface[key] = getValueAfterEquals(processedIface[key]);
      if (key === 'interface') {
        processedIface[key] = truncateString(decodeHexString(processedIface[key]), 13);
      }
    });
    return processedIface;
  };

  const getValueAfterEquals = (str) => {
    const value = str.split('=')[1]?.trim();
    return value ? value : <span className="not-public">Not Public Feature</span>;
  };

  const decodeHexString = (hexString) => {
    if (hexString.startsWith('0x')) {
      const hex = hexString.slice(2);
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    }
    return hexString;
  };

  const truncateString = (str, num) => {
    return str.length > num ? str.slice(0, num) + '...' : str;
  };

  return (
    <div className="App">
      <h1>SNMP Query</h1>
      <form onSubmit={handleSubmit} className="form">
        <label className="label">
          IP Address:
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="input"
          />
        </label>
        <button type="submit" className="button">Check</button>
      </form>
      {deviceInfo && (
        <div className="device-info">
          <h2>Device Information</h2>
          <ul>
            <li><strong>System Name:</strong> {deviceInfo.name}</li>
            <li><strong>System Description:</strong> {deviceInfo.description}</li>
            <li><strong>Uptime:</strong> {uptime}</li>
            <li><strong>Location:</strong> {deviceInfo.location}</li>
            <li><strong>Contact:</strong> {deviceInfo.contact}</li>
          </ul>
          <h2>Interfaces</h2>
          <div className="interface-window">
            <ul>
              {interfaces.map((iface, index) => (
                <li key={index} className="interface">
                  <strong>Interface:</strong> {iface.interface}
                  <ul>
                    <li><strong>Status:</strong> {iface.status}</li>
                    <li><strong>Speed:</strong> {iface.speed} bps</li>
                    <li><strong>Inbound Traffic:</strong> {iface.inbound_traffic} octets</li>
                    <li><strong>Outbound Traffic:</strong> {iface.outbound_traffic} octets</li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <h2>IPv4 Addresses</h2>
          <ul>
            {deviceInfo.IPv4_addresses.map((addr, index) => (
              <li key={index}>{addr}</li>
            ))}
          </ul>
          <h2>Operational Processes</h2>
          <div className="processes-info">
            <ul>
              {processes.map((process, index) => (
                <li key={index} className="process-item">{process}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
