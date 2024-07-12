const express = require('express')
const router = express.Router()
const snmp = require('net-snmp')

const deviceTemplateCopy = require('../models/DeviceModel.js');

//query device information
function checkDevice(targetIP) {
  const session = snmp.createSession(targetIP, 'public');

  const oids = [
    '1.3.6.1.2.1.1.3.0', // sysUpTime
    '1.3.6.1.2.1.2.2.1.8' // ifOperStatus for all interfaces
  ];

  let results = {
    sysUpTime: null,
    interfaces: []
  }

  //query system uptime
  session.get([oids[0]], (error, varbinds) => {
    if (error) {
      console.error('SNMP GET request failed:', error.toString());
    } else {
      // varbinds.forEach(varbind => {
      //   if (snmp.isVarbindError(varbind)) {
      //     console.error('Varbind Error:', snmp.varbindError(varbind));
      //   } else {
      //     console.log('System Uptime OID:', varbind.oid, 'Value:', varbind.value.toString());
      //   }
      // });
      results.sysUpTime = varbinds[0].value.toString();
    }
  });

  //query interface operational status
  session.walk(oids[1], 20, (error, varbinds) => {
    if (error) {
      console.error('SNMP Walk request failed:', error.toString());
    } else {
      varbinds.forEach(varbind => {
        if (snmp.isVarbindError(varbind)) {
          console.error('Varbind Error:', snmp.varbindError(varbind));
        } else {
          console.log('Interface Operational Status OID:', varbind.oid, 'Value:', varbind.value.toString());
          results.interfaces.push({
            oid: varbind.oid,
            status: varbind.value.toString()
          });
        }
      });
    }
    session.close();
  });
}


//search the device according to the IP address
//get connection information by the IP address proivde from the frontend
router.get('/search/ip', async (req, res) => {
  let ipAddress = req.body.ipAddress
  if (!targetDevice) {
    return res.status(400).json({ error: 'Enter a valid IP address' });
  }
  //create an SNMP session
  const session = snmp.createSession(ipAddress, 'public');
  try {
    let deviceData = await deviceTemplateCopy.findOne({ ipAddress: ipAddress }).exec()
    if (deviceData === null) {
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

  checkDevice(ipAddress, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.toString() });
    }
    res.json(results);
  });
});

//function to check the manufacturer based on OID prefix
function getManufacturer(oid) {
  const oidPrefix = oid.split('.').slice(0, 4).join('.');
  const manufacturers = {
    '1.3.6.1.4.1.9': 'Cisco',
    '1.3.6.1.4.1.11': 'HP',
    '1.3.6.1.4.1.2636': 'Juniper',
    '1.3.6.1.4.1.2021': 'UCD-SNMP',
    '1.3.6.1.2.1.1': 'MIB-II'
  };
  return manufacturers[oidPrefix] || 'Unknown';
}

//function to perform an SNMP walk and parse the data based on the manufacturer
function performSNMPWalk(target, oid) {
  const manufacturer = getManufacturer(oid);
  console.log(`Manufacturer: ${manufacturer}`);

  const session = snmp.createSession(target, 'public');

  //perform the SNMP walk
  session.walk(oid, 20, (error, varbinds) => {
    if (error) {
      console.error('SNMP walk failed:', error.toString());
    } else {
      varbinds.forEach(varbind => {
        if (snmp.isVarbindError(varbind)) {
          console.error('Varbind Error:', snmp.varbindError(varbind));
        } else {
          console.log('OID:', varbind.oid, 'Value:', varbind.value.toString());
        }
      });
    }
    session.close();
  });
}

//get decvice information by IP and OID provided from the frontend
router.get('/searchdevice', async (req, res) => {
  let ipAddress = req.body.ipAddress;
  let oid = req.body.oid;
  let result = performSNMPWalk(ipAddress, oid);
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


module.exports = router