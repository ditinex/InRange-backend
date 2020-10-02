const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review } = require('../models')

const {
	IsExists, IsExistsOne, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL,GeneratePassword
} = require('./BaseController');


module.exports = {
	/**
	 * @api {post} /consumer/createtask Create Task
	 * @apiName Create Task
	 * @apiGroup Task
	 *
	 * @apiParam {String} name Contact name without extra spaces and within 25 length
	 * @apiParam {String} title	Title without extra spaces and within 25 length
	 * @apiParam {Number} mobile Users unique mobile with ISD code i.e 919903614705.
	 * @apiParam {Sting} service Service type in text.
	 * @apiParam {String} description Description in text.
	 * @apiParam {String} instruction Service instruction (optional).
	 * @apiParam {String} landmark Address landmark (optional).
	 * @apiParam {String} houseno Address houseno (optional).
	 * @apiParam {String} address Address in text.
	 * @apiParam {Sting} status ENUM['Hiring', 'In-progress', 'Completed', 'Cancelled'].
	 * @apiParam {String} location JSON stringify string with coordinates i.e {"longitude":"-110.8571443","lattitude":"32.4586858"}.
	 * @apiParam {Files} images Service images (optional).
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
		{
			"status": "success",
			"data": {
				"cost": {
					"service_cost": 0,
					"other_cost": 0,
					"discount": 0,
					"total": 0
				},
				"images": [
					"/images/1600954873857.jpg",
					"/images/1600954873978.jpg"
				],
				"_id": "5f6ca1f95700d45738d6c86c",
				"title": "Tap Repair",
				"service": "repair",
				"description": "broken tap",
				"instruction": "Not specified",
				"name": "souradeep",
				"mobile": "919804985304",
				"status": "Hiring",
				"address": "india",
				"location": {
					"type": "Point",
					"coordinates": [
						-110.8571443,
						32.4586858
					]
				},
				"consumer": "5f67ac2e9a599b177fba55b5",
				"proposals": [],
				"createdAt": "2020-09-24T13:41:14.000Z",
				"updatedAt": "2020-09-24T13:41:14.000Z",
				"__v": 0
			}
		}
	 *
	 *
	 */
	CreateTask: async (req, res, next) => {
		try {
			const { service = '', description = '', instruction = '', mobile = '',address='',location='',landmark='',houseno='' } = req.body
			const name = req.body.name?req.body.name.trim() : ''
			const title = req.body.title?req.body.title.trim() : ''
			const user_id = req.user_id || ''
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
			else if (description.trim() == '' || service.trim() == '' || address.trim() =='')
				validateError = 'Required field should not be empty.'
			else if(user_id=='')
				validateError = 'Consumer id should not be empty.'

			if (validateError)
				return HandleError(res, validateError)

			let coordinates = {}
			try {
				coordinates = JSON.parse(location)
			}
			catch (e) {
				return HandleError(res, 'Invalid location cooridnates.')
			}

			let data = { title, service, description, instruction, name, mobile, status: 'Hiring', address, location: { type: 'Point', coordinates: [coordinates.longitude, coordinates.lattitude] }, consumer: user_id, landmark, houseno }

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

			let updated = await FindAndUpdate(User,{_id: user_id},{address: address})
			if (!updated)
				return HandleError(res, 'Failed to create task. Please contact system admin.')

			let inserted = await Insert(Task, data)
			if (!inserted)
				return HandleError(res, 'Failed to create task. Please contact system admin.')
			
			/*
			 * Creating an event task_change in self socket to server realtime database via socket
			 */
			RealtimeListener.taskChange.emit('task_change',inserted._id)

			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /consumer/edittask Edit Task
	 * @apiName Edit Task
	 * @apiGroup Task
	 *
	 * @apiParam {ObjectId} id Id of the task.
	 * @apiParam {String} name Contact name without extra spaces and within 25 length
	 * @apiParam {String} title	Title without extra spaces and within 25 length
	 * @apiParam {Number} mobile Users unique mobile with ISD code i.e 919903614705.
	 * @apiParam {Sting} service Service type in text.
	 * @apiParam {String} description Description in text.
	 * @apiParam {String} instruction Service instruction (optional).	 
	 * @apiParam {String} landmark Address landmark (optional).
	 * @apiParam {String} houseno Address houseno (optional).
	 * @apiParam {String} address Address in text.
	 * @apiParam {Sting} status ENUM['Hiring', 'In-progress', 'Completed', 'Cancelled'].
	 * @apiParam {String} location JSON stringify string with coordinates i.e {"longitude":"-110.8571443","lattitude":"32.4586858"}.
	 * @apiParam {Files} images Service images (optional).
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 *
	 *
	 */
	EditTask: async (req, res, next) => {
		try {
			const { id = '', service = '', description = '', instruction = '', mobile = '',address='',location='',landmark='',houseno='' } = req.body
			const name = req.body.name?req.body.name.trim() : ''
			const title = req.body.title?req.body.title.trim() : ''
			const user_id = req.user_id || ''
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
			else if (description.trim() == '' || service.trim() == '' || address.trim() =='')
				validateError = 'Required field should not be empty.'
			else if(user_id=='')
				validateError = 'Consumer id should not be empty.'
			else if(id=='')
				validateError = 'Failed to create task.'

			if (validateError)
				return HandleError(res, validateError)

			let coordinates = {}
			try {
				coordinates = JSON.parse(location)
			}
			catch (e) {
				return HandleError(res, 'Invalid location cooridnates.')
			}
			
			let where = { _id: id }
			let data = { title, service, description, instruction, name, mobile, status: 'Hiring', address, location: { type: 'Point', coordinates: [coordinates.longitude, coordinates.lattitude] }, consumer: user_id, landmark, houseno }

			if(images)
			{
				data.images=[]
				for(i=0;i<images.length;i++)
				{
					if(isDataURL(images[i]))
					{
						let isUploaded = await CompressImageAndUpload(images[i])
						if(!isUploaded)
							return HandleError(res,"Failed to upload images.")
						data.images[i] = isUploaded.path
					}
				}
			}
			let updated = await FindAndUpdate(Task, where, data)
			if (!updated)
				return HandleError(res, 'Failed to create task. Please contact system admin.')
			
			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /consumer/deletetask Delete Task
	 * @apiName Delete Task
	 * @apiGroup Task
	 *
	 * @apiParam {ObjectId} id Id of the task.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
		{
			"status": "success",
			"data": true
		}
	 */

	DeleteTask: async (req, res, next) => {
		try{
			let _id = (req.body.id)?req.body.id:''
			let validateError = ''
	
			if(_id === '')
				validateError = 'This field is required.'
	
			if(validateError)
				return HandleError(res,validateError)
			
			let update = await Delete(Task,{_id: _id})
	
			if(!update)
				return HandleError(res,'Failed to delete Task.')
	
			return HandleSuccess(res, update)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},

	
	/**
	 * @api {post} /provider/sendproposal Send Proposal
	 * @apiName Send Proposal
	 * @apiGroup Task
	 *
	 * @apiParam {ObjectId} task_id Id of the task.
	 * @apiParam {Sting} cover_letter Proposal letter in text.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
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
				"cost": {
					"service_cost": 0,
					"other_cost": 0,
					"discount": 0,
					"total": 0
				},
				"images": [
					"/images/1600840282151.jpg",
					"/images/1600840282166.jpg"
				],
				"_id": "5f6ae25a9647803978867259",
				"title": "Tap Repair test",
				"service": "repair",
				"description": "broken tap",
				"instruction": "Not specified",
				"name": "souradeep",
				"mobile": "919804985304",
				"status": "Hiring",
				"address": "india",
				"proposals": [
					{
						"_id": "5f6ae76860814f139cc9feb4",
						"provider": "5f67ac2e9a599b177fba55b5",
						"cover_letter": "hi"
					},
					{
						"_id": "5f6b28f1039e8158f879431b",
						"provider": "5f67ac2e9a599b177fba55b5",
						"cover_letter": "hi"
					}
				],
				"createdAt": "2020-09-23T05:51:22.187Z",
				"updatedAt": "2020-09-23T10:52:33.909Z",
				"__v": 0
			}
		}
	 *
	 *
	 */
	SendProposal: async (req, res, next) => {
		try {
			const { task_id = '', cover_letter = '' } = req.body
			const provider = req.user_id

			if(cover_letter.trim()=='')
				return HandleError(res, 'Cover letter is empty.')
			else if(provider=='' || task_id == '')
				return HandleError(res, 'Failed to send proposal.')
			
			const isProviderExists = await IsExists(User,{_id: provider})
			const isTaskExists = await IsExists(Task,{_id: task_id})
			const isProposalExists = await IsExistsOne(Task,{_id: task_id, 'proposals': {"$not": {$elemMatch: {provider: provider}}}})

			if(!isProviderExists)
				return HandleError(res, 'Provider doesn\'t exists.')
			else if(!isTaskExists)
				return HandleError(res, 'Task doesn\'t exists.')
			else if(!isProposalExists)
				return HandleError(res, 'Proposal Already exists.')

			const where = { _id: task_id }
			const query = { $push: { proposals: {provider: Mongoose.Types.ObjectId(provider),cover_letter: cover_letter}}}

			let updated = await FindAndUpdate(Task,where,query,true)
			if (!updated)
				return HandleError(res, 'Failed to send proposal.')

			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /consumer/acceptproposal Accept Proposal
	 * @apiName Accept Proposal
	 * @apiGroup Task
	 *
	 * @apiParam {ObjectId} task_id Id of the task.
	 * @apiParam {ObjectId} provider_id Id of the provider.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
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
				"cost": {
					"service_cost": 0,
					"other_cost": 0,
					"discount": 0,
					"total": 0
				},
				"images": [
					"/images/1600954873857.jpg",
					"/images/1600954873978.jpg"
				],
				"_id": "5f6ca1f95700d45738d6c86c",
				"title": "Tap Repair",
				"service": "repair",
				"description": "broken tap",
				"instruction": "Not specified",
				"name": "souradeep",
				"mobile": "919804985304",
				"status": "Hiring",
				"address": "india",
				"consumer": "5f67ac2e9a599b177fba55b5",
				"proposals": [],
				"createdAt": "2020-09-24T13:41:14.000Z",
				"updatedAt": "2020-09-24T14:34:24.676Z",
				"__v": 0,
				"provider": "5f67ac2e9a599b177fba55b5"
			}
		}
	 *
	 */

	AcceptProposal: async (req, res, next) => {
		try {
			const { task_id='',provider_id='' } = req.body

			if(task_id=='' || provider_id=='')
				return HandleError(res, 'Required field should not be empty.')
			
			const isProviderExists = await IsExists(User,{_id: provider_id})
			const isTaskExists = await IsExists(Task,{_id: task_id})

			if(!isProviderExists)
				return HandleError(res, 'Provider doesn\'t exists anymore.')
			else if(!isTaskExists)
				return HandleError(res, 'Task doesn\'t exists anymore.')

			const where = { _id: task_id }
			const query = { provider: provider_id }
	
			let updated = await FindAndUpdate(Task,where,query)
			if (!updated)
				return HandleError(res, 'Failed to accept proposal. Please contact system admin.')

			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /consumer/sendreview Send Review
	 * @apiName Send Review
	 * @apiGroup Task
	 *
	 * @apiParam {Number} rating Rating value between 1 and 5
	 * @apiParam {ObjectId} provider Id of the provider.
	 * @apiParam {String} username Name of user in text.
	 * @apiParam {String} feedback Feedback in text.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 *	{
			"status": "success",
			"data": {
				"rating": 2,
				"_id": "5f6c381085dad029f085cc8e",
				"provider": "5f67ac2e9a599b177fba55b5",
				"username": "Demo",
				"feedback": "Good Boy",
				"createdAt": "2020-09-24T06:09:20.464Z",
				"updatedAt": "2020-09-24T06:09:20.464Z",
				"__v": 0
			}
		}
	 *
	 */

	SendReview: async (req, res, next) => {
		try {
			const { rating = 1, provider = '', username = '', feedback= '' } = req.body

			if(username.trim()=='')
				return HandleError(res, 'Invalid username.')
			else if(provider=='')
				return HandleError(res, 'Invalid provider.')
			else if(!rating>=1 && !rating<=5)
				return HandleError(res, 'Rating must be between 1 to 5.')
			
			const isProviderExists = await IsExists(User,{_id: provider})
			const isUserExists = await IsExists(User,{name: username})

			if(!isProviderExists)
				return HandleError(res, 'Provider doesn\'t exists.')
			else if(!isUserExists)
				return HandleError(res, 'User doesn\'t exists.')

			let data = { rating, provider, username, feedback }

			let inserted = await Insert(Review, data)
			if (!inserted)
				return HandleError(res, 'Failed to send review. Please contact system admin.')

			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /consumer/gettasks List Tasks Consumer
	 * @apiName List Tasks Consumer
	 * @apiGroup Task
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
		{
			"status": "success",
			"data": [
				{
					"_id": "5f6ca1f95700d45738d6c86c",
					"cost": {
						"service_cost": 0,
						"other_cost": 0,
						"discount": 0,
						"total": 0
					},
					"images": [
						"/images/1600954873857.jpg",
						"/images/1600954873978.jpg"
					],
					"title": "Tap Repair",
					"service": "repair",
					"description": "broken tap",
					"instruction": "Not specified",
					"name": "souradeep",
					"mobile": "919804985304",
					"status": "Hiring",
					"address": "india",
					"location": {
						"type": "Point",
						"coordinates": [
							-110.8571443,
							32.4586858
						]
					},
					"consumer": "5f67ac2e9a599b177fba55b5",
					"proposals": [],
					"createdAt": "2020-09-24T13:41:14.000Z",
					"updatedAt": "2020-09-24T13:41:14.000Z",
					"__v": 0
				}
			]
		}
	 */

	GetTasksConsumer: async (req, res, next) => {
		try{
			const user_id = req.user_id || ''
			let validateError = ''
	
			if(user_id === '')
				validateError = 'This field is required.'
	
			if(validateError)
				return HandleError(res,validateError)
			
			let data = await Find(Task,{consumer: user_id})
	
			if(!data)
				return HandleError(res,'Failed to list Task.')
	
			return HandleSuccess(res, data)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /provider/gettasks List Tasks Provider
	 * @apiName List Tasks Provider
	 * @apiGroup Task
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 */

	GetTasksProvider: async (req, res, next) => {
		try{
			const user_id = req.user_id || ''
			let validateError = ''
	
			if(user_id === '')
				validateError = 'This field is required.'
	
			if(validateError)
				return HandleError(res,validateError)
			
			let data = await Find(Task,{provider: user_id})
	
			if(!data)
				return HandleError(res,'Failed to list Task.')
	
			return HandleSuccess(res, data)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /provider/gettaskbyid Get Task By Id
	 * @apiName Get Task By Id
	 * @apiGroup Task
	 * @apiDescription use /consumer/gettaskbyid for consumer
	 *
	 * @apiParam {ObjectId} id Id of the task.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
		{
			"status": "success",
			"data": [
				{
					"_id": "5f6ac1019b088f4c6cc2ed48",
					"cost": {
						"service_cost": 0,
						"other_cost": 0,
						"discount": 0,
						"total": 0
					},
					"images": [
						"/images/1600831745264.jpg",
						"/images/1600831745479.jpg"
					],
					"title": "Tap need",
					"service": "Tap repair",
					"description": "Good Task",
					"instruction": "Need Faster",
					"name": "Test",
					"mobile": "919804985304",
					"status": "Hiring",
					"address": "India",
					"location": {
						"type": "Point",
						"coordinates": [
							-110.8571443,
							32.4586858
						]
					},
					"proposals": [],
					"createdAt": "2020-09-23T03:29:05.501Z",
					"updatedAt": "2020-09-23T03:29:05.501Z",
					"__v": 0
				},
				{
					"_id": "5f6ca1f95700d45738d6c86c",
					"cost": {
						"service_cost": 0,
						"other_cost": 0,
						"discount": 0,
						"total": 0
					},
					"images": [
						"/images/1600954873857.jpg",
						"/images/1600954873978.jpg"
					],
					"title": "Tap Repair",
					"service": "repair",
					"description": "broken tap",
					"instruction": "Not specified",
					"name": "souradeep",
					"mobile": "919804985304",
					"status": "Hiring",
					"address": "india",
					"location": {
						"type": "Point",
						"coordinates": [
							-110.8571443,
							32.4586858
						]
					},
					"consumer": "5f67ac2e9a599b177fba55b5",
					"proposals": [],
					"createdAt": "2020-09-24T13:41:14.000Z",
					"updatedAt": "2020-09-24T14:34:24.676Z",
					"__v": 0,
					"provider": "5f67ac2e9a599b177fba55b5"
				}
			]
		}
	 */

	GetTaskById: async (req, res, next) => {
		try{
			let _id = req.body.id || ''
			let validateError = ''
	
			if(_id === '')
				validateError = 'This field is required.'
	
			if(validateError)
				return HandleError(res,validateError)
			
			let data = await Find(Task,{_id: _id})
	
			if(!data)
				return HandleError(res,'Failed to get Task.')
	
			return HandleSuccess(res, data)
	
		}catch (err) {
			HandleServerError(res, req, err)
		}
	},
}


