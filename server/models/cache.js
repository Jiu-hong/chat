const mongoose = require('mongoose')
const { Schema } = mongoose

const cache = new Schema({
    owner: String,
    command: String,
    content: Object,
})

module.exports = mongoose.model('Cache', cache)
