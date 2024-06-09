// src/DeviceInfo.js
import React, { useState } from 'react';
import OperationCard from './OperationCard';

function DeviceInfo({ devices, onSearch }) {
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [searchIp, setSearchIp] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchIp);
  };

  const handleChangeDevice = (event) => {
    setSelectedDeviceIndex(event.target.value);
  };

  const device = devices[selectedDeviceIndex];

  return (
    <div className="info-section">
      <form onSubmit={handleSearch}>
        <label>
          Search IP:
          <input
            type="text"
            value={searchIp}
            onChange={e => setSearchIp(e.target.value)}
            placeholder="Enter new IP address"
          />
        </label>
        <button type="submit">Search</button>
      </form>

      <h2>Device Information</h2>
      <div><strong>Name:</strong> {device.name}</div>
      <div><strong>Model:</strong> {device.model}</div>
      <div><strong>Version:</strong> {device.version}</div>
      <div><strong>IP Address:</strong> {device.ipAddress}</div>
      <h3>Interfaces:</h3>
      {device.interfaces.map((intf, index) => (
        <div key={index}>
          <strong>Type:</strong> {intf.type}<br/>
          <strong>Status:</strong> {intf.status}<br/>
          <strong>Rate:</strong> {intf.rate}
        </div>
      ))}
      <h3>Background Operations:</h3>
      <OperationCard ipAddress={device.ipAddress} />
    </div>
  );
}

export default DeviceInfo;
