const mongoose = require('mongoose')


const deviceTemplate = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
  },
  snmpVersion: {
    type: String,
    required: true
  },
  mib: [
    {
      oid: String,
      name: String,
      value: String,
      type: String,
      description: String
    }
  ],
  Geolocation: [
    {
      country: String,
      city: String,
      zip: Number
    }
  ],
  Hostname: {
    type: String,
    required: true
  },
  interfaceAmount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('device_infos', deviceTemplate)