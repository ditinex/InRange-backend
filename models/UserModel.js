const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema=new Schema({
	mobile:{type:String,required:true},
	profile:{
		consumer:{
			name:{type:String,required:true},
			gender:{type:String,required:true,enum:['male','female']},
		},
		provider:{
			name:{type:String,required:true},
			service:{type:String,required:true,enum:['plumber','cook','electrician','general service','truck','taxi']},
			description:{type:String},
			gender:{type:String,required:true,enum:['male','female']},
			profileImage:{type:String,required:true},
			verificationDocument:{type:String,required:true},
		}
	}
})

const UserModel = mongoose.model('users', UserSchema)
module.exports = UserModel