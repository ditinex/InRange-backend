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
	 * @api {post} /admin/createcoupon Create Coupon
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
	 * @api {post} /admin/editcoupon Edit Coupon
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
	 * @api {post} /admin/deletecoupon Delete Coupon
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
	 * @api {get} /admin/getallcoupon List All Coupons
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
	 * @api {post} /consumer/getcouponbycode Get Coupon Details By Code
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
	 * @api {get} /admin/getallusers List All Users
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
	 * @api {post} /admins/updateuserstatus Update User Status
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
			//Check service & verifydoc form submission in frontend
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


