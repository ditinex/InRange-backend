const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
	mobile: { type: String, required: true, unique: true, trim: true },
	name: { type: String, required: true, trim: true },
	profile_picture: { type: String, required: true, trim: true },
	gender: { type: String, required: true, enum: ['male', 'female'], trim: true },
	status: { type: String, required: true, trim: true, enum: ['pending', 'approved', 'suspended'] },
	is_switched_provider: { type: Boolean, required: true, default: false },
	address: { type: String },
	is_available: { type: Boolean, default: true, required: true },
	active_session_refresh_token: { type: String, required: true },
	access_token: { type: String },
	push_notification: { 
		push_token: { type: String },
		push_id: { type: String }
	 },
	subscription: {
        isSubscribed: {type: Boolean, default: false},
		amount: { type: Number, default: 0 },
		fromDate: { type: Date },
        toDate: { type: Date }
    },
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
		service: { type: String, trim: true },
		description: { type: String, trim: true },
		verification_document: { type: String, trim: true, default: null },
	}
},{ timestamps: true })

UserSchema.index({ location: '2dsphere' });

const UserModel = mongoose.model('users', UserSchema)
module.exports = UserModel