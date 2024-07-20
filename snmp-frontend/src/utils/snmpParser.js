// src/utils/snmpParser.js

export const parseSnmpResponse = (response) => {
    const parsedData = {};
  
    // Example of parsing the system description and system name
    const sysDescr = response.match(/SNMPv2-MIB::sysDescr.0 = STRING: (.+)/);
    const sysName = response.match(/SNMPv2-MIB::sysName.0 = STRING: (.+)/);
  
    if (sysDescr) {
      parsedData.systemDescription = sysDescr[1];
    }
  
    if (sysName) {
      parsedData.systemName = sysName[1];
    }
  
    // Example of parsing interfaces
    const interfaces = [];
    const interfacePattern = /IF-MIB::ifDescr.\d+ = STRING: (.+)/g;
    let match;
    while ((match = interfacePattern.exec(response)) !== null) {
      interfaces.push(match[1]);
    }
    parsedData.interfaces = interfaces;
  
    return parsedData;
  };
  