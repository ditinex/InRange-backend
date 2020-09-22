const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { Admin, Otp, User } = require('../models')


const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, GeneratePassword
} = require('./baseController');


module.exports = {
	/**
	 * @api {post} /admins/signup Add admin account
	 * @apiName AdminSignup
	 * @apiGroup Admin
	 *
	 * @apiParam {String} email Admins unique email.
	 * @apiParam {String} name Name contains alphabets only.
	 * @apiParam {String} password Password must contain atleast one number, one capital alphabet, one small alphabet, one special character and between 8-24 character.
	 * @apiParam {String} type Admin type as ENUM[ admin, analyst ].
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *			"status": "success",
	 *			"data": {
	 *				"_id": "5f62722a4bf8b92249c9caa6",
	 *				"name": "Demo Admin",
	 *				"email": "demo@demo.com",
	 *				"type": "admin",
	 *				"createdAt": "2020-09-16T20:14:34.112Z",
	 *				"updatedAt": "2020-09-16T20:14:34.112Z"
	 *			}
	 *	}
	 *
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 202 Error
	 *     {
	 *       "status": "failed", message: "Email already exists.",
	 *     }
	 */
	CreateTask: async (req, res, next) => {
		try {
			let name = req.body.name || ''
			let email = req.body.email || ''
			let password = req.body.password || ''
			let type = req.body.type || ''
			email = email.toLowerCase()
			let validateError = null
			if (!ValidateEmail(email))
				validateError = 'Please enter a valid email.'
			else if (!ValidateAlphanumeric(name) || !ValidateLength(name))
				validateError = 'Please enter a valid name without any special character and less than 25 character.'
			else if (type == '')
				validateError = 'Please select service type.'
			else if (!PasswordStrength(password))
				validateError = 'Please enter a password containing atleast one number, one capital alphabet, one small alphabet, one special character and between 8-24 character.'
			if (validateError)
				return HandleError(res, validateError)

			let salt = await bcrypt.genSalt(12);
			password = await bcrypt.hash(password, salt);

			const data = { name: name, email: email, password: password, type: type }
			let inserted = await Insert(Admin, data)
			if (inserted) {
				inserted = { ...inserted._doc }
				delete inserted.password
				delete inserted.__v
				return HandleSuccess(res, inserted)
			}
			else
				return HandleError(res, 'Email already exists.')


		} catch (err) {
			HandleServerError(res, req, err)
		}

	},

}


