const mongoose = require('mongoose')
const { Schema } = mongoose

const user = new Schema({
    email: String,
    password: String,
    name: String,
    comment: String,
    status: String,
    resetPasswordToken: String,
    resetPasswordExpires: String,
})

module.exports = mongoose.model('User', user)
