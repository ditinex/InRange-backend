const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChatSchema=new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    message: { type: String, trim: true, required: true },
    image: { type: String, trim: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    read: { type: Boolean, trim: true, required: true },
    delivered: { type: Boolean, trim: true, required: true },
},{ timestamps: true })

const ChatModel = mongoose.model('chats', ChatSchema)
module.exports = ChatModel