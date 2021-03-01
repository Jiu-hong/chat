const mongoose = require('mongoose')
const { Schema } = mongoose

const room = new Schema({
    host: String,
    roomId: String,
    roomName: String,
})

module.exports = mongoose.model('Room', room)
