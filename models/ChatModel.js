const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema=new Schema({
    sender_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    message: { type: String, trim: true },
    image: { type: String },
    seen: { type: Boolean, trim: true, required: true, default: false },

},{ timestamps: true })

const ChatSchema=new Schema({
    consumer_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    provider_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    task_id: { type: Schema.Types.ObjectId, ref: 'tasks', required: true },
    chats: [MessageSchema]
},{ timestamps: true })

const ChatModel = mongoose.model('chats', ChatSchema)
module.exports = ChatModel