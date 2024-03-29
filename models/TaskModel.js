const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TaskSchema = new Schema({
    title: { type: String, trim: true, required: true },
    service: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    instruction: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
	images: {type: Array, default: []},
    status: { type: String, required: true, trim: true, enum: ['Hiring', 'In-progress', 'Completed', 'Cancelled'] },
    address: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    houseno: { type: String, trim: true },
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
    cost: {
        service_cost: { type: Number, default: 0, required: true },
        other_cost: { type: Number, default: 0, required: true},
        discount: { type: Number, default: 0, required: true},
        total: { type: Number, default: 0, required: true},
        readytopay: { type: Boolean, required: true, default: false },
        paymentmethod: { type: String }
    },
    consumer: { type: Schema.Types.ObjectId, ref: 'users' },
    provider: { type: Schema.Types.ObjectId, ref: 'users' },
    proposals: [{
        provider: { type: Schema.Types.ObjectId, ref: 'users' },
        cover_letter: { type: String, trim: true },
        interviewed: { type: Boolean, required: true, default: false}
    }],
	
},{ timestamps: true })

TaskSchema.index({ location: '2dsphere' });

const TaskModel = mongoose.model('tasks', TaskSchema)
module.exports = TaskModel