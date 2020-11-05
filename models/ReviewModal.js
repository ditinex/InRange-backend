const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema=new Schema({
    provider: { type: Schema.Types.ObjectId, ref: 'users' },
    username: { type: String, trim: true, required: true },
    rating: { type: Number, default: 1, min: 1, max: 5, required: true },
    feedback: { type: String, trim: true },
    task_id: { type: Schema.Types.ObjectId, ref: 'tasks' },
},{ timestamps: true })

const ReviewModel = mongoose.model('reviews', ReviewSchema)
module.exports = ReviewModel