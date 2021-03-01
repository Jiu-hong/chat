const mongoose = require('mongoose')
const { Schema } = mongoose

const contact = new Schema({
    host: String,
    hostname: String,
    contact: String,
    contactname: String,
})

module.exports = mongoose.model('Contact', contact)
