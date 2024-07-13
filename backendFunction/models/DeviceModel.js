const mongoose = require('mongoose');
const { type } = require('os');


const deviceTemplate = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
  },
  snmpVersion: {
    type: String,
    required: true
  },
  mib: {
    type: String
  },
  Geolocation: [
    {
      country: {
        type: String
      },
      city: {
        type: String
      },
      zip: {
        type: Number
      }
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