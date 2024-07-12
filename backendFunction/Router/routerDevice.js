const express = require('express')
const router = express.Router()
const snmp = require('net-snmp')

const deviceTemplateCopy = require('../models/DeviceModel.js');

//search the device according to the IP address
router.get('/search', async (req, res) => {
  let ipAddress = req.body.ipAddress
  try {
    let deviceData = await deviceTemplateCopy.findOne({ ipAddress: ipAddress }).exec()
    if (deviceData.length === 0) {
      return res.status(404).json({
        message: 'No records found'
      });
    }
    res.status(200).json({ deviceData });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while searching', details: error.toString()
    })
  }
  res.send(deviceData)
});

//connect the device (re-connection)
router.get('/connect', (req, res) => {
  let ipAddress = req.body.ipAddress;
  let snmpVersion = req.body.snmpVersion;

  deviceTemplateCopy.findOne({ ipAddress: ipAddress }, (err, device) => {
    if (err) return res.status(500).json({ message: 'Database query error' });

    if (device) {
      return res.json(device.info);
    } else {
      const session = snmp.createSession(ipAddress, 'public', snmpVersion);
      session.get(['1.3.6.1.2.1.1.1.0'], (error, varbinds) => {
        if (error) {
          return res.status(500).json({ message: `SNMP request failed: ${error.message}` });
        } else {
          // const deviceInfo = {
          //   description: varbinds[0].value.toString()
          // };

          // const newDevice = new deviceTemplateCopy({
          //   ipAddress: ipAddress,
          //   snmpVersion: snmpVersion,
          //   info: deviceInfo
          // });

          varbinds.forEach(varbind => {
            if (snmp.isVarbindError(varbind)) {
              console.error("Varbind Error:", snmp.varbindError(varbind));
            } else {
              console.log("OID:", varbind.oid, "Value:", varbind.value.toString());
            }
          });

          // newDevice.save((err) => {
          //   if (err) return res.status(500).json({ message: 'Error saving device to database' });

          //   res.json(deviceInfo);
          // });
        }
        session.close();
      });
    }
  });
});


//get the device info by OID
router.get('/search/oid', async (res, req) => {
  const { oid } = req.body.oid
  if (!oid) {
    res.status(401).json({
      message: "please provide valide OID number"
    })
  }
  try {
    session.get([oid], (error, varbinds) => {
      if (error) {
        console.error('SNMP GET request failed:', error.toString());
      } else {
        varbinds.forEach(varbind => {
          if (snmp.isVarbindError(varbind)) {
            console.error('Varbind Error:', snmp.varbindError(varbind));
          } else {
            varbinds.forEach(varbind => {
              if (snmp.isVarbindError(varbind)) {
                console.error("Varbind Error:", snmp.varbindError(varbind));
              } else {
                console.log("OID:", varbind.oid, "Value:", varbind.value.toString());
              }
            });
          }
        });
      }
      session.close();
    });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while searching', details: error.toString()
    })
  }
})

//add the new device (connect the device does not exist in DB)
router.post('/add', (res, req) => {
  const deviceInfo = new deviceTemplateCopy({
    ipAddress: req.body.ipAddress,
    snmpVersion: req.body.snmpVersion,
    oid: req.body.oid,
    Geolocation: req.body.Geolocation,
    hostname: req.body.hostname,
    interfaceAmount: req.body.interfaceAmount
  })
  deviceInfo.save()
  .then(data => {
    res.status(200).json(data)
    console.log('successfully add device')
  })
  .catch(error => {
    res.json(error)
    console.log(error)
  })
});

module.exports = router