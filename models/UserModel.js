const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
	mobile: { type: Number, required: true, trim: true, unique: true },
	name: { type: String, required: true, trim: true },
	profile_picture: { type: String, required: true, trim: true },
	gender: { type: String, required: true, enum: ['male', 'female'], trim: true },
	status: { type: String, required: true, trim: true, enum: ['pending', 'approved', 'suspended'] },
	is_switched_provider: { type: Boolean, required: true, default: false },
	address: { type: String },
	isOnline: { type: Boolean, default: false },
	active_session: { type: String, required: true },
	location: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	provider: {
		service: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		verificationDocument: { type: String, trim: true, default: null },
	}
},{ timestamps: true })

UserSchema.index({ location: '2dsphere' });

const UserModel = mongoose.model('users', UserSchema)
module.exports = UserModel