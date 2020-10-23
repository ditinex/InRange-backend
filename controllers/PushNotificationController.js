const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { SendSMS,RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL,GeneratePassword
} = require('./BaseController');


module.exports = {

    /**
	 * @api {put} /pnc/updatetoken Update Firebase Token
	 * @apiName Update Firebase Token
	 * @apiGroup PushNotification
	 *
	 * @apiParam {File} profile_picture Picture to change.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     

	*/

	UpdateToken: async (req, res, next) => {
		try {
            

		} catch (err) {
			HandleServerError(res, req, err)
		}
    },
}


