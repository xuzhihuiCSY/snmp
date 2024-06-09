// src/deviceData.js
const deviceData = [
  {
    name: "Network Device 1",
    model: "Model X",
    version: "1.0",
    interfaces: [
      { type: "Ethernet", status: "Active", rate: "1 Gbps" },
      { type: "Ethernet", status: "Inactive", rate: "100 Mbps" }
    ],
    ipAddress: "192.168.1.1"
  },
  {
    name: "Network Device 2",
    model: "Model Y",
    version: "2.0",
    interfaces: [
      { type: "Fiber", status: "Active", rate: "10 Gbps" },
      { type: "Ethernet", status: "Active", rate: "1 Gbps" }
    ],
    ipAddress: "192.168.1.2"
  }
];

export default deviceData;
