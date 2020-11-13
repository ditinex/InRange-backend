const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema=new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    read: { type: Boolean, required: true },
    is_provider: { type: Boolean, required: true }
},{ timestamps: true })

const NotificationModel = mongoose.model('notifications', NotificationSchema)
module.exports = NotificationModel