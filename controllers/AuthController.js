const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Config = require('../config.js')
const fs = require('fs')
const { SendSMS } = require('../services')
const { Admin, Otp, User, App } = require('../models')
const { RealtimeListener } = require('../services')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, GeneratePassword, IsExistsOne
} = require('./BaseController');


module.exports = {

	GetAppInfo: async (req, res, next) => {
		try {
			const appInfo = await Find(App)
			if(!appInfo)
				return HandleError(res, 'App doesn\'t exists.')

			return HandleSuccess(res, appInfo[0])

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
	 *     
{
    "status": "success",
    "data": {
        "_id": "5f67ac2e9a599b177fba55b5",
        "provider": {
            "verification_document": null,
            "service": "",
            "description": ""
        },
        "is_switched_provider": false,
        "is_available": true,
        "name": "Demo",
        "gender": "male",
        "mobile": "919903614706",
        "address": "kjhkd kjdhfbk",
        "status": "approved",
        "location": {
            "type": "Point",
            "coordinates": [
                -110.8571443,
                32.4586858
            ]
        },
        "active_session_refresh_token": "5OwDBqzHLUFj54TJ",
        "profile_picture": "/images/1600629806826.jpg",
        "createdAt": "2020-09-20T19:23:26.855Z",
        "updatedAt": "2020-09-20T19:26:52.477Z",
        "__v": 0,
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjdhYzJlOWE1OTliMTc3ZmJhNTViNSIsIm1vYmlsZSI6IjkxOTkwMzYxNDcwNiIsIm5hbWUiOiJEZW1vIiwiaWF0IjoxNjAwNjMwMDc0LCJleHAiOjE2MDA3MTY0NzR9.FMZe0ttT1qtzvXbCbO_uKLj_EHwIDslDO4uq_IVw2_E",
        "isUserExists": true
    }
}
	 *
	 *
	 */
	Login: async (req, res, next) => {
		try {
			const { mobile = '', otp = '' } = req.body
			let validateError = null
			if (!ValidateMobile(mobile.trim()))
				validateError = 'Please enter a valid mobile number without ISD code i.e 990xxxxx05.'

			if (validateError)
				return HandleError(res, validateError)

			let expiry = new Date ();
			expiry.setMinutes ( expiry.getMinutes() - Config.otpExpiryLimit );

			if (otp) {
				//Validate OTP and Login
				let isOtpExists = await IsExists(Otp, { mobile: mobile, otp: otp, createdAt: { $gt: expiry } })
				let isUserExists = await IsExists(User, { mobile: mobile })
				if(!isOtpExists)
					return HandleError(res, 'Failed to verify OTP.')
				else if(isOtpExists && isUserExists){
					Delete(Otp,{ mobile: mobile })
					let user = {... isUserExists[0]}
					const active_session_refresh_token = GeneratePassword()
					const access_token = jwt.sign({ id: user._id, mobile: user.mobile, name: user.name }, Config.secret, {
						expiresIn: Config.tokenExpiryLimit // 86400 expires in 24 hours -- It should be 1 hour in production
					});
		
					let updated = await FindAndUpdate(User, {_id: user._id}, {access_token: access_token, active_session_refresh_token: active_session_refresh_token})
					let userData = {... updated._doc}
					
					if(!updated)
						return HandleError(res, 'Failed to generate access token.')
					
						const query = [
							{ $match: { _id: user._id }},
							{ $lookup : 
								{ from: 'reviews', localField: '_id', foreignField: 'provider', as: 'reviews' }
							},
							{ $project:
								{
									rating: {$avg: '$reviews.rating'}
								}
							}
						]
						let findrating = await Aggregate(User,query)
					userData.rating = findrating[0].rating
					userData.access_token = access_token
					userData.active_session_refresh_token = active_session_refresh_token
					userData.isUserExists = true
					return HandleSuccess(res, userData)
				}

				//If no user found
				return HandleSuccess(res, { isUserExists: false })
			}
			// Send OTP
			let isOtpExists = await IsExists(Otp, { mobile: mobile, createdAt: { $gt: expiry } })
			if(isOtpExists)
				return HandleError(res, 'Too many OTP requests. Please try after sometime.')

			const otpValue = Math.floor(1000 + Math.random() * 9000);
			let smsStatus = null
			if(Config.environment !== 'DEV'){
			if(Config.plivo_authid)
				smsStatus = await SendSMS('+'+mobile,'Your InRangeIt One Time Password is '+otpValue)
			if(smsStatus && smsStatus.errorMessage)
				return HandleError(res, 'Failed to send OTP. Please contact system admin.')
			}
			const inserted = await Insert(Otp,{otp: otpValue, mobile: mobile})
			if(!inserted)
				return HandleError(res, 'Failed to send OTP.')
			return HandleSuccess(res, { otp: otpValue })


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
	 * @apiParam {String} gender ENUM[male,female].
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
				console.log(coordinates)
			}
			catch (e) {
				return HandleError(res, 'Invalid location cooridnates.')
			}

			let data = { name, gender, mobile, address, status: 'approved', location: { type: 'Point', coordinates: [coordinates.longitude, coordinates.latitude] }, provider: { service: service, description: description } }
			data.active_session_refresh_token = GeneratePassword()

			if (service) {
				data.is_switched_provider = true
				if(service=='Taxi' || service=='Truck')
					data.status = 'pending'
			}

			let isUploaded = await CompressImageAndUpload(profile_picture)
			if(!isUploaded)
				return HandleError(res,"Failed to upload profile pic.")
			data.profile_picture = isUploaded.path
			
			if(verification_document){
				isUploaded = await CompressImageAndUpload(verification_document)
				if(!isUploaded)
					return HandleError(res,"Failed to upload verification document.")
				data.provider.verification_document = isUploaded.path
			}

			let inserted = await Insert(User, data)
			if (!inserted)
				return HandleError(res, 'Failed to create account. Please contact system admin.')

			inserted = { ...inserted._doc }
			const access_token = jwt.sign({ id: inserted._id, mobile: inserted.mobile, name: inserted.name }, Config.secret, {
				expiresIn: Config.tokenExpiryLimit // 86400 expires in 24 hours -- It should be 1 hour in production
			});

			let updated = await FindAndUpdate(User, {_id: inserted._id}, {access_token: access_token})
			if(!updated)
				return HandleError(res, 'Failed to update access token.')
			
			let user = {... updated._doc}
				const query = [
					{ $match: { _id: inserted._id }},
					{ $lookup : 
						{ from: 'reviews', localField: '_id', foreignField: 'provider', as: 'reviews' }
					},
					{ $project:
						{
							rating: {$avg: '$reviews.rating'}
						}
					}
				]
	
				let findrating = await Aggregate(User,query)
				user.rating = findrating[0].rating
			/*
            * Creating an event provider_change in self socket to server realtime database via socket
            */
			if(updated.is_switched_provider)
			   RealtimeListener.providerChange.emit('provider_change',updated._id)
			
			return HandleSuccess(res, user)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /auth/refresh-token/:mobile/:token Refresh access token
	 * @apiName RefreshToken
	 * @apiGroup Auth
	 *
	 * @apiParam {String} token Refresh token of the user.
	 * @apiParam {Number} mobile Registered mobile number.
	 *
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
{
    "status": "success",
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjdhYzJlOWE1OTliMTc3ZmJhNTViNSIsIm1vYmlsZSI6IjkxOTkwMzYxNDcwNiIsIm5hbWUiOiJEZW1vIiwiaWF0IjoxNjAwNjMyMDgxLCJleHAiOjE2MDA3MTg0ODF9.Uj642GC9-b_dkoTR1lrq2Z3PouybDz1Q-gzAw2TRCCI"
    }
}
	 *
	 */
	RefreshToken: async (req, res, next) => {
		try {
			const { token='', mobile='' } = req.params
			if(!token.trim() || !mobile.trim())
				return HandleError(res, 'Invalid mobile or token.')
			
			const isUserExists = await IsExists(User,{mobile: mobile, active_session_refresh_token: token})
			if(!isUserExists)
				return HandleError(res, 'User doesn\'t exists.')

			const access_token = jwt.sign({ id: isUserExists[0]._id, mobile: isUserExists[0].mobile, name: isUserExists[0].name }, Config.secret, {
				expiresIn: Config.tokenExpiryLimit // 86400 expires in 24 hours -- It should be 1 hour in production
			});

			let updated = await FindAndUpdate(User, { _id: isUserExists[0]._id }, { access_token: access_token })
			if (!updated)
				return HandleError(res, 'Failed to generate access token.')

			return HandleSuccess(res, {access_token: access_token})

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},


	/**
	 * @api {get} /auth/login-by-token/:mobile/:token Login with token
	 * @apiName LoginWithToken
	 * @apiGroup Auth
	 *
	 * @apiParam {String} token Refresh token of the user.
	 * @apiParam {Number} mobile Registered mobile number.
	 *
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
                88.1567362,
                22.8258274
            ]
        },
        "provider": {
            "verification_document": null,
            "service": "",
            "description": ""
        },
        "is_switched_provider": false,
        "is_available": true,
        "_id": "5f6e252a761041600f5146fd",
        "name": "Demo Consumer",
        "gender": "male",
        "mobile": "919903614705",
        "address": "",
        "status": "approved",
        "active_session_refresh_token": "d7o0I0K30lZi15c0",
        "profile_picture": "/images/1601053994590.jpg",
        "createdAt": "2020-09-25T17:13:14.616Z",
        "updatedAt": "2020-09-27T14:35:26.281Z",
        "__v": 0,
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNmUyNTJhNzYxMDQxNjAwZjUxNDZmZCIsIm1vYmlsZSI6IjkxOTkwMzYxNDcwNSIsIm5hbWUiOiJEZW1vIENvbnN1bWVyIiwiaWF0IjoxNjAxMjE3MzI2LCJleHAiOjE2MDEzMDM3MjZ9.XbCj5mAqxudjH0bJ8LV71TI3pgV99Uf1OM_1oQ53Yfo"
    }
}
	 *
	 */
	LoginByToken: async (req, res, next) => {
		try {
			const { token='', mobile='' } = req.params
			if(!token.trim() || !mobile.trim())
				return HandleError(res, 'Invalid mobile or token.')
			
			const isUserExists = await IsExists(User,{mobile: mobile, active_session_refresh_token: token})
			if(!isUserExists)
				return HandleSuccess(res, { isUserExists: false })

			const access_token = jwt.sign({ id: isUserExists[0]._id, mobile: isUserExists[0].mobile, name: isUserExists[0].name }, Config.secret, {
				expiresIn: Config.tokenExpiryLimit // 86400 expires in 24 hours -- It should be 1 hour in production
			});

			let updated = await FindAndUpdate(User, { _id: isUserExists[0]._id }, { access_token: access_token })
			if (!updated)
				return HandleError(res, 'Failed to generate access token.')

			let user = {... updated._doc}
			const query = [
				{ $match: { _id: isUserExists[0]._id }},
				{ $lookup : 
					{ from: 'reviews', localField: '_id', foreignField: 'provider', as: 'reviews' }
				},
				{ $project:
					{
						rating: {$avg: '$reviews.rating'}
					}
				}
			]
			let findrating = await Aggregate(User,query)
			user.rating = findrating[0].rating
			user.isUserExists = true
			return HandleSuccess(res, user)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	}
	
}


