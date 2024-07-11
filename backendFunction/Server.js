const express = require('express');
const mongoose = require('mongoose')
const app = express();
const bodyParser = require('body-parser');
const snmp = require('net-snmp');
const routerDevice = require('./Router/routerDevice');
const routerTest = require('./Router/routerTest');


const uri = "mongodb+srv://Sean_cluster:Xtx199284=@e-commerce.xyeoe40.mongodb.net/?retryWrites=true&w=majority";

async function connect(){
    try{
        // mongoose.set("strictQuery", false);
        await mongoose.connect(uri)
        .then(()=>{
          console.log("Connected to MongoDB");
        })
        .catch(err => {
          console.error('Error connecting to MongoDB', err);
        });
    } catch(error){
        console.log(error);
    }
}

connect();

//express middleware
app.use(bodyParser.json());
app.use(express.json());
app.use('/snmp', routerDevice);
app.use('/test', routerTest);
app.use((req, res, next)=>{
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

//SNMP manager
// const createSession = (target, community, version = snmp.Version2c) => {
//   return snmp.createSession(target, community, { version: version });
// };


app.listen(5000, () => {
  console.log('Server running on port 5000');
});