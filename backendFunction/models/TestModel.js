const mongoose = require('mongoose');
const { type } = require('os');

const testTemplate = mongoose.Schema({
    name: {
        type: String
    },
    gender: {
        type: String
    },
    location: [
        {
            city: {
                type: String,
                require: true
            },
            zip: {
                type: Number,
                require: true
            }
        }
    ]
});

module.exports = mongoose.model('test_info', testTemplate)