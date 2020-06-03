const mongoose = require("mongoose"),
            passportLocalMongoose = require("passport-local-mongoose"),
            Settings = require("./settings")

var studentSchema = new mongoose.Schema({
    username: String,
    
    profile:{
        firstname: String,
        middlename: String,
        lastname: String,
        student_id: String,
        current_level: String
    },
    demographics:{
        age: {
            type: Number,
            default: 1
        },
        gender: {
            type: String,
            default: null
        },
        birthday: { 
            type: Date, 
            default: Date.now() 
        },
        religion: {
            type: String, 
            default: null
        },
        phone: {
            type: String,
            default: null
        },
        phone_sec: {
            type: String,
            default: "Not set"
        },
        contact_address: {
            type: String,
            default: null
        }
    },
    records: {
        results: {
            type: String,
            default: null
        }
   }

})
studentSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("student", studentSchema)