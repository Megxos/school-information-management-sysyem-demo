const mongoose = require("mongoose")

var settingsSchema = new mongoose.Schema({
    mode: { 
        type: String, 
        default: "light" 
    }
})

module.exports = mongoose.model("settings", settingsSchema)