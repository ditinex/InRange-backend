const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { Admin, Otp, User } = require('../models')


const {
	Insert, Find, CompressImageAndUpload, FindAndUpdate,
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
	AdminSignup: async (req, res, next) => {
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

	AdminLogin: async (req, res, next) => {
		try {

			let email = req.body.email || ''
			let password = req.body.password || ''
			email = email.toLowerCase()
			let validateError = null

			if (email == '')
				validateError = 'Email field empty'
			else if (password == '')
				validateError = 'Enter the password'

			if (validateError)
				return HandleError(res, validateError)

			const where = { 'email': email }
			let doc = await Find(Admin, where)
			if (doc.length > 0) {
				doc = doc[0]
				if (await bcrypt.compare(password, doc.password) == true) {	//if password matches
					//Creating access token.
					doc.token = jwt.sign({ id: doc._id, type: doc.typec }, Config.secret, {
						expiresIn: 86400 // 86400 expires in 24 hours
					});
					delete doc.password
					delete doc.__v
					return HandleSuccess(res, doc)
				}
				else
					return HandleError(res, 'Incorrect Password.')
			}
			else
				return HandleError(res, 'User does not exists.')


		} catch (err) {
			HandleServerError(res, req, err)
		}

	},

	/**
	 * @api {post} /auth/login Login to user account
	 * @apiName Login User
	 * @apiGroup Auth
	 *
	 * @apiParam {Number} mobile User's unique mobile number.
	 * @apiParam {Number} otp OTP.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *			
	 *	   }
	 *
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 202 Error
	 *     {
	 *       "status": "failed", message: "Email already exists.",
	 *     }
	 */
	Login: async (req, res, next) => {
		try {
			const { mobile = '', otp = '' } = req.body

			let validateError = null
			if (!ValidateMobile(mobile.trim()))
				validateError = 'Please enter a valid mobile number with ISD code i.e 1990xxxxx05.'

			if (validateError)
				return HandleError(res, validateError)

			if (otp) {
				//Validate OTP and Login
				//Generate session

				//If no user found
				return HandleSuccess(res, { isUserExists: false })
			}

			const isOtpExists = await Find(Otp, { mobile: mobile })
			//Send otp if otp limit not reached


		} catch (err) {
			HandleServerError(res, req, err)
		}

	},

	/**
	 * @api {post} /auth/signup Add user account
	 * @apiName Signup User
	 * @apiGroup Auth
	 *
	 * @apiParam {Number} mobile Users unique mobile with ISD code i.e 919903614705.
	 * @apiParam {String} name
	 * @apiParam {Sting} gender ENUM[male,female].
	 * @apiParam {String} address Address in text (optional).
	 * @apiParam {File} profile_picture Form encoded image file.
	 * @apiParam {String} service (applicable for provider only).
	 * @apiParam {String} description (optional & application for provider only).
	 * @apiParam {String} location JSON stringify string with coordinates i.e {"longitude":"-110.8571443","lattitude":"32.4586858"}.
	 * @apiParam {File} verification_document (optional & applicable only for certain services in provider).
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
{
    "status": "success",
    "data": {
        "location": {
            "type": "Point",
            "coordinates": [
                -110.8571443,
                32.4586858
            ]
        },
        "provider": {
            "verification_document": null,
            "service": "",
            "description": ""
        },
        "is_switched_provider": false,
        "is_available": true,
        "_id": "5f6504df4619710c2354cbf4",
        "name": "Demo",
        "gender": "male",
        "mobile": 919903614705,
        "address": "21 Parking Street",
        "status": "approved",
        "active_session_refresh_token": "sfYP6WRAoF9q2GPG",
        "profile_picture": "/images/1600455903339.jpg",
        "createdAt": "2020-09-18T19:05:03.461Z",
        "updatedAt": "2020-09-18T19:05:03.799Z",
        "__v": 0,
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjUwNGRmNDYxOTcxMGMyMzU0Y2JmNCIsIm1vYmlsZSI6OTE5OTAzNjE0NzA1LCJuYW1lIjoiRGVtbyIsImlhdCI6MTYwMDQ1NTkwMywiZXhwIjoxNjAwNTQyMzAzfQ._Aey4GEfFhWzmVrWgccfzbPL3lvmGEzGvM6Ndc1QkPk"
    }
}
	 *
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 202 Error
	 *     {
	 *       "status": "failed", message: "Email already exists.",
	 *     }
	 */
	Signup: async (req, res, next) => {
		try {
			const { name = '', gender = '', mobile = '', location = '', address = '', service = '', description = '' } = req.body
			const { profile_picture = null, verification_document = null } = req.files

			//Check service & verifydoc form submission in frontend

			let validateError = null
			if (!ValidateAlphanumeric(name.trim()) || !ValidateLength(name.trim()))
				validateError = 'Please enter a valid name without any special character and less than 25 character.'
			else if (gender.trim() == '')
				validateError = 'Please select gender.'
			else if (location == '')
				validateError = 'Failed to access location. Please restart the app and allow all permissions.'
			else if (!profile_picture)
				validateError = 'Please upload a profile picture.'

			if (validateError)
				return HandleError(res, validateError)

			let coordinates = {}
			try {
				coordinates = JSON.parse(location)
			}
			catch (e) {
				return HandleError(res, 'Invalid location cooridnates.')
			}

			let data = { name, gender, mobile, address, status: 'approved', location: { type: 'Point', coordinates: [coordinates.longitude, coordinates.lattitude] }, provider: { service: service, description: description } }
			data.active_session_refresh_token = GeneratePassword()

			if (service) {
				data.is_switched_provider = true
			}

			let isUploaded = await CompressImageAndUpload(profile_picture)
			if(!isUploaded)
				return HandleError(res,"Failed to upload profile pic.")
			data.profile_picture = isUploaded.path
			
			if(verification_document){
				isUploaded = await CompressImageAndUpload(verification_document)
				if(!isUploaded)
					return HandleError(res,"Failed to upload verification document.")
				data.provider.verificationDocument = isUploaded.path
				data.status = 'pending'
			}

			let inserted = await Insert(User, data)
			if (!inserted)
				return HandleError(res, 'Failed to create account. Please contact system admin.')

			inserted = { ...inserted._doc }
			const access_token = jwt.sign({ id: inserted._id, mobile: inserted.mobile, name: inserted.name }, Config.secret, {
				expiresIn: 86400 // 86400 expires in 24 hours -- It should be 1 hour in production
			});

			let updated = await FindAndUpdate(User, {_id: inserted._id}, {access_token: access_token})
			if(!updated)
				return HandleError(res, 'Failed to update access token.')
			
			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}

	},
}


