const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdminSchema=new Schema({
	name:{type:String,required:true,trim:true},
	email:{type:String,required:true,trim:true, unique: true, lowercase: true,},
	type:{type:String,required:true,enum:['admin','analyst']},
	password: { type: String, required: true, trim: true }
},{ timestamps: true })

const AdminModel = mongoose.model('admins', AdminSchema)
module.exports = AdminModel