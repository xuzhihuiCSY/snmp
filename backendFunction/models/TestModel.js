const mongoose = require('mongoose');
const { type } = require('os');

const testTemplate = mongoose.Schema({
    name: {
        type: String
    },
    gender: {
        type: String
    },
    location: {
        type: Object,
        require: true
    }
});

module.exports = mongoose.model('test_info', testTemplate)