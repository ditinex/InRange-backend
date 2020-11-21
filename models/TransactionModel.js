const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema=new Schema({
    provider_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    task_id: { type: Schema.Types.ObjectId, ref: 'tasks' },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['Cr', 'Dr']},
    description: { type: String},
    status: { type: String, required: true, enum: ['Pending', 'Completed', 'Cancelled'] }
},{ timestamps: true })

const TransactionModel = mongoose.model('transactions', TransactionSchema)
module.exports = TransactionModel