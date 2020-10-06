const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { Admin, Otp, User, Task, Mongoose, Review, Coupon } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL, GeneratePassword
} = require('./BaseController');
const { query } = require('express');


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

	/**
	 * @api {post} /admins/login Admin Login
	 * @apiName Admin Login
	 * @apiGroup Admin
	 *
	 * @apiParam {String} email Admins unique email.
	 * @apiParam {String} password Admins password.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 */
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
				return HandleError(res, 'Admin does not exists.')


		} catch (err) {
			HandleServerError(res, req, err)
		}

	},

	/**
	 * @api {get} /admins/listalladmin List All Admins
	 * @apiName List All Admins
	 * @apiGroup Admin
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 * 
	 */

	GetAllAdmins: async (req, res, next) => {
		try{
			
			let data = await Find(Admin)
	
			if(!data)
				return HandleError(res,'Failed to list Admin.')
	
			return HandleSuccess(res, data)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {delete} /admins/deleteadmin Delete Admin
	 * @apiName Delete Admin
	 * @apiGroup Admin
	 *
	 * @apiParam {ObjectId} id Id of the admin.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
		{
			"status": "success",
			"data": true
		}
	 */

	DeleteAdmin: async (req, res, next) => {
		try{
			console.log(req)
			const { id = '' } = req.body
			let validateError = ''
	
			if(id === '')
				validateError = 'This field is required.'
	
			if(validateError)
				return HandleError(res,validateError)
			
			let update = await Delete(Admin,{_id: id})
	
			if(!update)
				return HandleError(res,'Failed to delete Admin.')
	
			return HandleSuccess(res, update)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},


	/**
	 * @api {post} /admins/createcoupon Create Coupon
	 * @apiName Create Coupon
	 * @apiGroup Coupon
	 *
	 * @apiParam {String} code Code without extra spaces and alphanumeric.
	 * @apiParam {Boolean} isPercent True or False.
	 * @apiParam {Number} amount A number greater than 0.
	 * @apiParam {Sting} expiry Date in text.
	 * @apiParam {Boolean} isActive True or False.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 *
	 *
	 */
	CreateCoupon: async (req, res, next) => {
		try {
			const { code = '', isPercent = false, amount = 0, expiry = '',isActive=true } = req.body
			let validateError = null
			if (!ValidateAlphanumeric(code))
				validateError = 'Please enter a valid alphanumeric code.'
			else if (amount <= 0)
				validateError = 'Please enter a amount greater than 0.'
			else if(expiry=='')
				validateError = 'Expiry date should not be empty.'

			if (validateError)
				return HandleError(res, validateError)

			let data = { code, isPercent, amount, expiry, isActive }

			let inserted = await Insert(Coupon, data)
			if (!inserted)
				return HandleError(res, 'Failed to create coupon.')
			
			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {put} /admins/editcoupon Edit Coupon
	 * @apiName Edit Coupon
	 * @apiGroup Coupon
	 *
	 * @apiParam {ObjectId} id Id of coupon code.
	 * @apiParam {String} code Code without extra spaces and alphanumeric.
	 * @apiParam {Boolean} isPercent True or False.
	 * @apiParam {Number} amount A number greater than 0.
	 * @apiParam {Sting} expiry Date in text.
	 * @apiParam {Boolean} isActive True or False.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 *
	 *
	 */
	EditCoupon: async (req, res, next) => {
		try {
			const { id = '',code = '', isPercent = false, amount = 0, expiry = '',isActive=true } = req.body

			let validateError = null
			if (!ValidateAlphanumeric(code))
				validateError = 'Please enter a valid alphanumeric code.'
			else if (amount >= 0)
				validateError = 'Please enter a amount greater than 0.'
			else if(expiry=='')
				validateError = 'Expiry date should not be empty.'
			else if(id=='')
				validateError = 'Failed to create coupon.'

			if (validateError)
				return HandleError(res, validateError)

			const where = { _id: id }
			const query = { code, isPercent, amount, expiry, isActive }

			let updated = await FindAndUpdate(Coupon, where, query)
			if (!updated)
				return HandleError(res, 'Failed to update coupon.')
			
			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {delete} /admins/deletecoupon Delete Coupon
	 * @apiName Delete Coupon
	 * @apiGroup Coupon
	 *
	 * @apiParam {ObjectId} id Id of the coupon.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
		{
			"status": "success",
			"data": true
		}
	 */

	DeleteCoupon: async (req, res, next) => {
		try{
			const { id = '' } = req.body
			let validateError = ''
	
			if(id === '')
				validateError = 'This field is required.'
	
			if(validateError)
				return HandleError(res,validateError)
			
			let update = await Delete(Coupon,{_id: id})
	
			if(!update)
				return HandleError(res,'Failed to delete Coupon.')
	
			return HandleSuccess(res, update)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /admins/getallcoupon List All Coupons
	 * @apiName List All Coupons
	 * @apiGroup Coupon
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 * 
	 */

	GetAllCoupons: async (req, res, next) => {
		try{
			
			let data = await Find(Coupon)
	
			if(!data)
				return HandleError(res,'Failed to list Coupon.')
	
			return HandleSuccess(res, data)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /consumer/getcouponbycode Get Coupon Details By Code
	 * @apiName Get Coupon Details By Code
	 * @apiGroup Coupon
	 *
	 * @apiParam {String} code Code of the coupon.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 */

	GetCouponByCode: async (req, res, next) => {
		try{
			const { code = '' } = req.body
			let validateError = ''
	
			if(code.trim() === '')
				validateError = 'Code should not be empty!'
	
			if(validateError)
				return HandleError(res,validateError)
			
			let data = await Find(Coupon,{code: code})
	
			if(!data)
				return HandleError(res,'Failed to get Coupon.')
	
			return HandleSuccess(res, data)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /admins/getallusers List All Users
	 * @apiName List All Users
	 * @apiGroup Admin
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 {
    "status": "success",
    "data": [
        {
            "_id": "5f67ac2e9a599b177fba55b5",
            "provider": {
                "service": "",
                "description": ""
            },
            "name": "Demo",
            "gender": "male",
            "mobile": "919903614706",
            "address": "india",
            "status": "approved",
            "profile_picture": "/images/1601090029587.jpg",
            "provider_task": [
                {
                    "_id": "5f6ca1f95700d45738d6c86c",
                    "cost": {
                        "total": 0
                    },
                    "title": "Tap Repair",
                    "status": "Hiring",
                    "createdAt": "2020-09-24T13:41:14.000Z"
                }
            ],
            "consumer_task": [
                {
                    "_id": "5f6ca1f95700d45738d6c86c",
                    "cost": {
                        "total": 0
                    },
                    "title": "Tap Repair",
                    "status": "Hiring",
                    "createdAt": "2020-09-24T13:41:14.000Z"
                }
            ],
            "reviews": [
                {
                    "rating": 2,
                    "username": "Demo",
                    "feedback": "Good Boy"
                }
            ],
            "average_rating": 3.3333333333333335
        }
    ]
}
	 */
	
	GetAllUsers: async (req, res, next) => {
		try{
            const query = [
                { $lookup : 
                    { from: 'tasks', localField: '_id', foreignField: 'provider', as: 'provider_task' }
				},
				{ $lookup : 
                    { from: 'tasks', localField: '_id', foreignField: 'consumer', as: 'consumer_task' }
				},
				{ $lookup : 
                    { from: 'reviews', localField: '_id', foreignField: 'provider', as: 'reviews' }
                },
                { $project : {
                    _id: 1,
                    mobile: 1,
                    name: 1,
					profile_picture: 1,
					gender: 1,
					status: 1,
					address: 1,
					average_rating: {$avg: '$reviews.rating'},
					provider_task: { _id: 1, title: 1, cost: {total: 1}, createdAt: 1, status: 1 },
					consumer_task: { _id: 1, title: 1, cost: {total: 1}, createdAt: 1, status: 1 },
					reviews: {rating: 1,feedback: 1,username: 1},
					provider: {service: 1, description: 1}
                } }
            ]

            let data = await Aggregate(User,query)
            if(!data)
                    return HandleError(res, 'No Data Found.')
            return HandleSuccess(res, data)
		
		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {put} /admins/updateuserstatus Update User Status
	 * @apiName Update User Status
	 * @apiGroup Admin
	 *
	 * @apiParam {ObjectId} id Id of the user.
	 * @apiParam {String} status Status text [approved or suspended].
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 */

	UpdateUserStatus: async (req, res, next) => {
		try {
            const id = req.body.id || ''
			const status = req.body.status || ''
			
            let validateError = null
            if (id == '')
				validateError = 'Invalid id.'
			if (!(status === 'approved' || status === 'suspended'))
                validateError = 'Invalid status text.'

			if (validateError)
				return HandleError(res, validateError)

            let updated = await FindAndUpdate(User, {_id: id}, {status: status})
            if(!updated)
                return HandleError(res, 'Failed to update status.')
			return HandleSuccess(res, updated)
		
		} catch (err) {
			HandleServerError(res, req, err)
		}
    },
}


