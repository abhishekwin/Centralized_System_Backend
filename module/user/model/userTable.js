const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    name: { type: String, required: true },
},
    {
        versionKey: false // You should be aware of the outcome after set to false
    });

const User = module.exports = mongoose.model('User', userSchema);
