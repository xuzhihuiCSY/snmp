const mongoose = require('mongoose');
const { type } = require('os');


const deviceTemplate = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  snmpVersion: {
    type: String,
    required: true
  },
  mib: {
    type: String
  },
  Geolocation: {
    type: {
      country: String,
      city: String,
      zip: String
    },
    required: true
  },
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