const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    password:String,
    balance:Number
})

const user = mongoose.model('user',UserSchema);

module.exports = user
