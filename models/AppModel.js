const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FaqSchema=new Schema({
    question: { type: String, trim: true },
    answer: { type: String, trim: true }
})

const AppSchema=new Schema({
    android_version: { type: String },
    ios_version: { type: String },
    is_in_maintenance: { type: Boolean, require: true, default: false },
    maintenance_time: { type: Date },
    faqs: [FaqSchema],
    howtouse: [FaqSchema]
},{ strict: false })
const AppModel = mongoose.model('appinfos', AppSchema)
module.exports = AppModel