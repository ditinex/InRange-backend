const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CouponSchema=new Schema({
    code: { type: String, trim: true, required: true },
    isPercent: { type: Boolean, require: true, default: false },
    amount: { type: Number, required: true },
    expiry: { type: String, required: true },
    isActive: { type: Boolean, require: true, default: true }
},{ timestamps: true })

const CouponModel = mongoose.model('coupons', CouponSchema)
module.exports = CouponModel