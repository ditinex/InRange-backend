const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { SendSMS,RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Notification } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL,GeneratePassword
} = require('./BaseController');




module.exports = {
	
	SendNotification: async (title,description,user_id) => {
		try {

			let validateError = null
            if (user_id == '')
                return false;

            const user = await IsExistsOne(User, { _id: user_id })
            if (!user)
                return false;
			

			let data = { title, description, user_id, read: false, is_provider: user.is_switched_provider }

			let inserted = await Insert(Notification, data)
			if (!inserted)
				return false;

			return true;

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},
	
}


