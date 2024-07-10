const express = require('express')
const router = express.Router()

const deviceTemplateCopy = require('../models/DeviceModel')

//connect the device (re-connection)
router.post('/device/connect', (req, res) => {
    const { ipAddress, snmpVersion } = req.body;
  
    deviceTemplateCopy.findOne({ ipAddress: ipAddress }, (err, device) => {
      if (err) return res.status(500).json({ message: 'Database query error' });
  
      if (device) {
        return res.json(device.info);
      } else {
        const session = createSession(ipAddress, 'public', snmpVersion);
  
        session.get(['1.3.6.1.2.1.1.1.0'], (error, varbinds) => {
          if (error) {
            return res.status(500).json({ message: `SNMP request failed: ${error.message}` });
          } else {
            const deviceInfo = {
              description: varbinds[0].value.toString()
            };
  
            const newDevice = new deviceTemplateCopy({
              ipAddress: ipAddress,
              snmpVersion: snmpVersion,
              info: deviceInfo
            });
  
            newDevice.save((err) => {
              if (err) return res.status(500).json({ message: 'Error saving device to database' });
  
              res.json(deviceInfo);
            });
          }
          session.close();
        });
      }
    });
  });


  //search the device according to the IP address
  router.post('/search', async (res, req) => {
    const {ipAddress} = req.body.ipAddress
    if(!ipAddress){
      res.status(401).json({
        message: "please provide valide IP address"
      })
    }
    try{
      const deviceData = await deviceTemplateCopy.findOne({ipAddress: ipAddress})
      if (results.length === 0) {
        return res.status(404).json({ 
          message: 'No records found'
        });
      }
      res.status(200).json({ deviceData });
    }catch(error){
      res.status(500).json({
        error: 'An error occurred while searching', details: error.toString()
      })
    }
    res.send(deviceData)
  });

  //add the new device (connect the device does not exist in DB)
  router.post('/devide/add', async (res, req) => {
    add(res, req, (err) => {
      if(err){
        console.log(err)
      }else{
        const deviceInfo = new deviceTemplateCopy({
          ipAddress: req.body.ipAddress,
        })
      }
    })
  });

  module.exports = router