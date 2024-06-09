import React, { useState } from 'react';

function ConnectionForm({ onSubmit }) {
  const [ipAddress, setIpAddress] = useState('');
  const [snmpVersion, setSnmpVersion] = useState('v2c');
  const [authInfo, setAuthInfo] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ipAddress, snmpVersion, authInfo });
  };

  return (
    <div>
      <h1>Connect to Network Device</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            IP Address:
            <input
              type="text"
              value={ipAddress}
              onChange={e => setIpAddress(e.target.value)}
              placeholder="Enter IP address"
              required
            />
          </label>
        </div>
        <div>
          <label>
            SNMP Version:
            <select value={snmpVersion} onChange={e => setSnmpVersion(e.target.value)}>
              <option value="v2c">SNMP v2c</option>
              <option value="v3">SNMP v3</option>
            </select>
          </label>
        </div>
        {/* <div>
          <label>
            Authentication Info (optional):
            <input
              type="text"
              value={authInfo}
              onChange={e => setAuthInfo(e.target.value)}
            />
          </label>
        </div> */}
        <button type="submit">Connect</button>
      </form>
    </div>
  );
}

export default ConnectionForm;
