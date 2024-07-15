const express = require('express')
const router = express.Router()
const testTemplateCopy = require('../models/TestModel.js')

//search the info by name
router.get('/name', async (req, res) => {
    let name = req.body.name
    console.log(name)
    let result = await testTemplateCopy.findOne({category: name}).exec()
    res.send(result)
});

//search the info by gender
router.get('/gender', async (req, res) => {
    let gender = req.body.gender;
    let result = await testTemplateCopy.find({category: gender}).exec();
    res.send(result)
});

//add new info
router.post('/add', async (req, res) => {
    // let city = req.body.city
    // let zip = req.body.zip
    const testInfo = new testTemplateCopy({
        name: req.body.name,
        gender: req.body.gender,
        location: {
            city: req.body.city,
            zip: req.body.zip
        }
    })
    await testInfo.save()
    .then(data=>{
        res.status(200).json(data)
        console.log('successfully added')
    })
    .catch(err=>{
        res.json(err)
        console.log(err)
    })
});

module.exports = router