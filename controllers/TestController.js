const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review } = require('../models')
const Controllers = require('../controllers')

const {
	IsExists, IsExistsOne, Insert, Find, FindOne,CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL, GeneratePassword, Aggregate
} = require('./BaseController');


module.exports = {
	
	onProviderChange: async (req, res, next) => {
		try {
			
			let user = await FindOne(User,{_id: '5fd3c363d70fac4cb9d03aec'})
			user.location.coordinates = [88.1906268,22.8249988]
			RealtimeListener.providerChange.emit('provider_change',user._id)
			//RealtimeListener.taskChange.emit('task_change', inserted._id, inserted.service)

			return HandleSuccess(res, user._id)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

}