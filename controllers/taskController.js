const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { Admin, Otp, User, Task } = require('../models')


const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, GeneratePassword
} = require('./baseController');


module.exports = {
	/**
	 * @api {post} /consumer/createtask Create Task
	 * @apiName Create Task
	 * @apiGroup Task
	 *
	 * @apiParam {String} name Contact name without extra spaces and within 25 length
	 * @apiParam {String} title	Title without extra spaces and within 25 length
	 * @apiParam {Number} mobile Users unique mobile with ISD code i.e 919903614705.
	 * @apiParam {Sting} service Service type in text (optional).
	 * @apiParam {String} description Description in text (optional).
	 * @apiParam {String} instruction Service instruction (optional).
	 * @apiParam {String} address Address in text (optional).
	 * @apiParam {Sting} status ENUM['Hiring', 'In-progress', 'Completed', 'Cancelled'].
	 * @apiParam {String} location JSON stringify string with coordinates i.e {"longitude":"-110.8571443","lattitude":"32.4586858"}.
	 * @apiParam {Files} images Service images (optional).
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *		"status": "success",
	 *		"data": {
	 *			"cost": {
	 *				"service_cost": 0,
	 *				"other_cost": 0,
	 *				"discount": 0,
	 *				"total": 0
	 *			},
	 *				"images": [
	 *					"/images/1600831745264.jpg",
	 *					"/images/1600831745479.jpg"
	 *				],
	 *				"_id": "5f6ac1019b088f4c6cc2ed48",
	 *				"title": "Tap need",
	 *				"service": "Tap repair",
	 *				"description": "Good Task",
	 *				"instruction": "Need Faster",
	 *				"name": "Test",
	 *				"mobile": "919804985304",
	 *				"status": "Hiring",
     *				"address": "India",
     *				"location": {
     *					"type": "Point",
     *					"coordinates": [
     *						-110.8571443,
     *						32.4586858
     *					]
     *				},
     *				"proposals": [],
     *				"createdAt": "2020-09-23T03:29:05.501Z",
     *				"updatedAt": "2020-09-23T03:29:05.501Z",
     *				"__v": 0
     *			}
     *		}
	 *
	 *
	 */
	CreateTask: async (req, res, next) => {
		try {
			const { service = '', description = '', instruction = '', mobile = '', status = '',address='',location='' } = req.body
			const name = req.body.name?req.body.name.trim() : ''
			const title = req.body.title?req.body.title.trim() : ''
			//Check images of task in frontend
			const images = req.files?req.files.images : null

			let validateError = null
			if (!ValidateAlphanumeric(name) || !ValidateLength(name))
				validateError = 'Please enter a valid name without any special character and less than 25 character.'
			else if (!ValidateAlphanumeric(title) || !ValidateLength(title))
				validateError = 'Please enter a valid task title without any special character and less than 25 character.'
			else if (!ValidateMobile(mobile))
				validateError = 'Please enter valid mobile number.'
			else if (location == '')
				validateError = 'Failed to access location. Please restart the app and allow all permissions.'
			else if (description.trim() == '' || service.trim() == '')
				validateError = 'Required field should not be empty.'

			if (validateError)
				return HandleError(res, validateError)

			let coordinates = {}
			try {
				coordinates = JSON.parse(location)
			}
			catch (e) {
				return HandleError(res, 'Invalid location cooridnates.')
			}

			let data = { title, service, description, instruction, name, mobile, status: 'Hiring', address, location: { type: 'Point', coordinates: [coordinates.longitude, coordinates.lattitude] } }

			if(images)
			{
				data.images=[]
				for(i=0;i<images.length;i++)
				{
					let isUploaded = await CompressImageAndUpload(images[i])
					if(!isUploaded)
						return HandleError(res,"Failed to upload images.")
					data.images[i] = isUploaded.path
				}
			}
			let inserted = await Insert(Task, data)
			if (!inserted)
				return HandleError(res, 'Failed to create task. Please contact system admin.')
			
			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

}


