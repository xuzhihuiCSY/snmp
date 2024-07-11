const mongoose = require('mongoose');
const { type } = require('os');

const testTemplate = mongoose.Schema({
    name: {
        type: String
    },
    gender: {
        type: String
    }
});

module.exports = mongoose.model('test_info', testTemplate)