const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PnSchema=new Schema({
    firetoken: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
},{ timestamps: true })

const PnModel = mongoose.model('pntokens', PnSchema)
module.exports = PnModel