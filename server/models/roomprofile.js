const mongoose = require('mongoose')
const { Schema } = mongoose

const roomProfile = new Schema({
    founder: String,
    roomId: String,
    roomName: String,
})

module.exports = mongoose.model('RoomProfile', roomProfile)
