import React, { useState } from 'react';
import DeviceInfo from './DeviceInfo';
import ConnectionForm from './ConnectionForm';
import deviceData from './deviceData';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);

  const handleFormSubmit = (formData) => {
    console.log('Connection Details:', formData);
    setConnected(true);
  };

  const handleSearchIp = (ipAddress) => {
    console.log('Searching for device with IP:', ipAddress);
    // Add logic here if needed to handle IP search
  };

  return (
    <div className="App">
      {connected ? (
        <DeviceInfo devices={deviceData} onSearch={handleSearchIp} />
      ) : (
        <ConnectionForm onSubmit={handleFormSubmit} />
      )}
    </div>
  );
}

export default App;
