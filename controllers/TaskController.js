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
			const { service = '', description = '', instruction = '', mobile = '', address = '', location = '', landmark = '', houseno = '' } = req.body
			const name = req.body.name ? req.body.name.trim() : ''
			const title = req.body.title ? req.body.title.trim() : ''
			const user_id = req.user_id || ''
			const images = req.files ? Array.isArray(req.files.images) ? req.files.images : [req.files.images] : null

			let validateError = null
			if (!ValidateAlphanumeric(name) || !ValidateLength(name))
				validateError = 'Please enter a valid name without any special character and less than 25 character.'
			else if (!ValidateAlphanumeric(title) || !ValidateLength(title,50))
				validateError = 'Please enter a valid task title without any special character and less than 25 character.'
			else if (!ValidateMobile(mobile))
				validateError = 'Please enter valid mobile number.'
			else if (location == '')
				validateError = 'Failed to access location. Please restart the app and allow all permissions.'
			else if (description.trim() == '' || service.trim() == '' || address.trim() == '')
				validateError = 'Required field should not be empty.'
			else if (user_id == '')
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

			if (images) {
				data.images = []
				for (i = 0; i < images.length; i++) {
					let isUploaded = await CompressImageAndUpload(images[i])
					if (!isUploaded)
						return HandleError(res, "Failed to upload images.")
					data.images[i] = isUploaded.path
				}
			}

			let updated = await FindAndUpdate(User, { _id: user_id }, { address: address })
			if (!updated)
				return HandleError(res, 'Failed to create task. Please contact system admin.')

			let inserted = await Insert(Task, data)
			if (!inserted)
				return HandleError(res, 'Failed to create task. Please contact system admin.')

			/*
			 * Creating an event task_change in self socket to server realtime database via socket
			 */
			RealtimeListener.taskChange.emit('task_change', inserted._id, inserted.service)

			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {put} /consumer/edittask Edit Task
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
			const { id = '', service = '', description = '', instruction = '', mobile = '', address = '', location = '', landmark = '', houseno = '' } = req.body
			const name = req.body.name ? req.body.name.trim() : ''
			const title = req.body.title ? req.body.title.trim() : ''
			const user_id = req.user_id || ''
			//Check images of task in frontend
			const images = req.files ? req.files.images : null

			let validateError = null
			if (!ValidateAlphanumeric(name) || !ValidateLength(name))
				validateError = 'Please enter a valid name without any special character and less than 25 character.'
			else if (!ValidateAlphanumeric(title) || !ValidateLength(title))
				validateError = 'Please enter a valid task title without any special character and less than 25 character.'
			else if (!ValidateMobile(mobile))
				validateError = 'Please enter valid mobile number.'
			else if (location == '')
				validateError = 'Failed to access location. Please restart the app and allow all permissions.'
			else if (description.trim() == '' || service.trim() == '' || address.trim() == '')
				validateError = 'Required field should not be empty.'
			else if (user_id == '')
				validateError = 'Consumer id should not be empty.'
			else if (id == '')
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

			if (images) {
				data.images = []
				for (i = 0; i < images.length; i++) {
					if (isDataURL(images[i])) {
						let isUploaded = await CompressImageAndUpload(images[i])
						if (!isUploaded)
							return HandleError(res, "Failed to upload images.")
						data.images[i] = isUploaded.path
					}
				}
			}
			let updated = await FindAndUpdate(Task, where, data)
			if (!updated)
				return HandleError(res, 'Failed to create task. Please contact system admin.')

			/*
			 * Creating an event task_change in self socket to server realtime database via socket
			 */
			RealtimeListener.taskChange.emit('task_change', updated._id, updated.service)
			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {delete} /consumer/deletetask Delete Task
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
		try {
			let _id = (req.body.id) ? req.body.id : ''
			let validateError = ''

			if (_id === '')
				validateError = 'This field is required.'

			if (validateError)
				return HandleError(res, validateError)

			let update = await Delete(Task, { _id: _id })

			if (!update)
				return HandleError(res, 'Failed to delete Task.')

			return HandleSuccess(res, update)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /consumer/cancel-task Cancel Task
	 * @apiName Cancel Task
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

	CancelTask: async (req, res, next) => {
		try {
			let _id = (req.body.id) ? req.body.id : ''
			let validateError = ''

			if (_id === '')
				validateError = 'This field is required.'

			if (validateError)
				return HandleError(res, validateError)
				
			let where = { _id: _id }
			let data = { status: 'Cancelled'}

			let updated = await FindAndUpdate(Task, where, data)
			if (!updated)
				return HandleError(res, 'Failed to cancel task. Please contact system admin.')
			
			if(updated.provider)
			{
				let completed = await FindAndUpdate(User, { _id: updated.provider }, { is_available: true })
				if (!completed)
					return HandleError(res, 'Failed to cancel task. Please contact system admin.')

			}
			
			// Realtime change
			RealtimeListener.inProgressTaskChange.emit('task-change',{task_id: updated._id})
			RealtimeListener.taskChange.emit('task_change', updated._id, updated.service,'cancel')

			/*
			 * Send Notification
			 */

			 if(updated.provider)
			 {
				const isProviderExists = await IsExists(User, { _id: updated.provider })
				if(isProviderExists)
					Controllers.User.SendNotification({
						title:	'Task Cancelled',
						description: 'The task '+updated.title+' has been cancelled by the consumer.',
						user_id: updated.provider,
						read: false,
						is_provider: true,
						push_id: isProviderExists[0].push_token
					})

			 }

			return HandleSuccess(res, updated);
		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	DoneTask: async (req, res, next) => {
		try {
			let _id = (req.body.id) ? req.body.id : ''
			let validateError = ''

			if (_id === '')
				validateError = 'This field is required.'

			if (validateError)
				return HandleError(res, validateError)


			let where = { _id: _id }
			let data = { 'cost.readytopay': true }

			let updated = await FindAndUpdate(Task, where, data)
			if (!updated)
				return HandleError(res, 'Failed to done task. Please contact system admin.')
			// Realtime change
			RealtimeListener.inProgressTaskChange.emit('task-change',{task_id: updated._id})
			/*
			 * Send Notification
			 */

				const isConsumerExists = await IsExists(User, { _id: updated.consumer })
				
				if(isConsumerExists)
					Controllers.User.SendNotification({
						title:	'Task Almost Completed',
						description: 'The task '+updated.title+' is almost complete. Please pay as soon as possible.',
						user_id: updated.consumer,
						read: false,
						is_provider: false,
						push_id: isConsumerExists[0].push_token
					})
			return HandleSuccess(res, updated);
		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {put} /provider/sendproposal Send Proposal
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

			if (cover_letter.trim() == '')
				return HandleError(res, 'Cover letter is empty.')
			else if (provider == '' || task_id == '')
				return HandleError(res, 'Failed to send proposal.')

			const isProviderExists = await IsExists(User, { _id: provider })
			const isTaskExists = await IsExists(Task, { _id: task_id })
			const isProposalExists = await IsExistsOne(Task, { _id: task_id, 'proposals': { $elemMatch: { provider: provider } } })
			if (!isProviderExists)
				return HandleError(res, 'Provider doesn\'t exists.')
			else if (!isTaskExists)
				return HandleError(res, 'Task doesn\'t exists.')
			else if (isProposalExists)
				return HandleError(res, 'Proposal Already exists.')

			const where = { _id: task_id }
			const query = { $push: { proposals: { provider: Mongoose.Types.ObjectId(provider), cover_letter: cover_letter } } }

			let updated = await FindAndUpdate(Task, where, query, true)
			if (!updated)
				return HandleError(res, 'Failed to send proposal.')

			/*
			 *  Send Notification 
			 */
				const isConsumerExists = await IsExists(User, { _id: isTaskExists[0].consumer })
				if(isConsumerExists)
					Controllers.User.SendNotification({
						title:	'New Task Proposal',
						description: isProviderExists[0].name+' send you a proposal for the task "'+isTaskExists[0].title+'".',
						user_id: isTaskExists[0].consumer,
						read: false,
						is_provider: false,
						push_id: isConsumerExists[0].push_token
					})

			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {put} /consumer/acceptproposal Accept Proposal
	 * @apiName Accept Proposal
	 * @apiGroup Task
	 *
	 * @apiParam {ObjectId} task_id Id of the task.
	 * @apiParam {ObjectId} provider_id Id of the provider.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 * 
	 *
	 */

	AcceptProposal: async (req, res, next) => {
		try {
			const { task_id = '', provider_id = '' } = req.body
			const user_id = req.user_id || ''

			if (task_id == '' || provider_id == '' || user_id == '')
				return HandleError(res, 'Required field should not be empty.')

			const isProviderAvailable = await IsExists(User, { _id: provider_id, is_available: true })
			const isTaskExists = await IsExists(Task, { _id: task_id })

			if (!isProviderAvailable)
				return HandleError(res, 'Provider doesn\'t available.')
			else if (!isTaskExists)
				return HandleError(res, 'Task doesn\'t exists anymore.')

			let update = await FindAndUpdate(User, { _id: provider_id }, { is_available: false })
			if (!update)
				return HandleError(res, 'Failed to accept proposal. Please contact system admin.')

			const where = { _id: task_id }
			const query = { provider: provider_id, status: 'In-progress' }

			let updated = await FindAndUpdate(Task, where, query)
			if (!updated)
				return HandleError(res, 'Failed to accept proposal. Please contact system admin.')
			/*
			* Creating an event provider_change in self socket to server realtime database via socket
			*/
			RealtimeListener.providerChange.emit('provider_change', provider_id)

			/*
			 * Creating an event send-notification 
			 */

			const isProviderExists = await IsExists(User, { _id: updated.provider })
			 
			if(isProviderExists)
				Controllers.User.SendNotification({
					title:	'Task Proposal Accepted',
					description: 'Your Proposal has been accepted for the task '+isTaskExists[0].title,
					user_id: updated.provider,
					read: false,
					is_provider: true,
					push_id: isProviderExists[0].push_token
				})

			// return HandleSuccess(res, updated)
			let query2 = [
				{ $match: { consumer: Mongoose.Types.ObjectId(user_id) } },
				{
					"$unwind": {
						"path": "$proposals",
						"preserveNullAndEmptyArrays": true
					}
				},
				{
					$lookup:
					{
						from: "users",
						let: { id: "$proposals.provider" },
						pipeline: [
							{
								$match: {
									"$expr": { "$eq": ["$_id", "$$id"] }
								}
							},
							{ $project: { access_token: 0, active_session_refresh_token: 0, 'provider.verification_document': 0 } },
							{
								$lookup:
									{ from: 'reviews', localField: '_id', foreignField: 'provider', as: 'reviews' }
							},
							{ $addFields: { average_rating: { $avg: '$reviews.rating' } } },
							{
								$lookup:
								{ 
									from: 'tasks',
									let: { provider_id: "$_id" },
									pipeline: [
										{
											$match: {
												$and: [
													{$expr: { $eq: [ '$provider', '$$provider_id' ] }},
													{$expr: { $eq: [ '$status', 'Completed' ] }}
												]
											}
											
										},
									],
									as: 'total_completed_task'
								}
							},
							{ $addFields: { total_completed_task: {$size:"$total_completed_task"} } },
							{
								$lookup:
									{ 
										from: 'tasks',
										let: { provider_id: "$_id" },
										pipeline: [
											{
												$match: {
													$and: [
														{$expr: { $eq: [ '$provider', '$$provider_id' ] }},
														{$expr: { $eq: [ '$status', 'Completed' ] }}
													]
												}
												
											},
											{ $sort: { createdAt: -1 } },
											{ $limit: 3 },
											{ $project: { title: 1, updatedAt: 1 } },
										],
										as: 'pastTask'
									}
							},
						],
						as: 'proposals.provider'
					}
				},
				{
					"$unwind": {
						"path": "$proposals.provider",
						"preserveNullAndEmptyArrays": true
					}
				},
				{
					$group: {
						_id: "$_id",
						cost: { "$first":"$cost" },
						provider: { "$first":"$provider" },
						images: { "$first":"$images" },
						title: { "$first": "$title" },
						service: { "$first": "$service" },
						description: { "$first": "$description" },
						instruction: { "$first": "$instruction" },
						name: { "$first": "$name" },
						mobile: { "$first": "$mobile" },
						status: { "$first": "$status" },
						address: { "$first": "$address" },
						location: { "$first": "$location" },
						consumer: { "$first": "$consumer" },
						landmark: { "$first": "$landmark" },
						houseno: { "$first": "$houseno" },
						proposals: { $push: "$proposals" }
					}
				},
			]
			let data2 = await Aggregate(Task, query2)

			if (!data2.length)
				return HandleSuccess(res, [])

			return HandleSuccess(res, data2)


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
			const { rating = 0, provider = '', username = '', feedback = '',task_id = '' } = req.body

			if (username.trim() == '')
				return HandleError(res, 'Invalid username.')
			else if (provider == '')
				return HandleError(res, 'Invalid provider.')
			else if (!rating > 0 && !rating <= 5)
				return HandleError(res, 'Rating must be between 1 to 5.')

			const isProviderExists = await IsExists(User, { _id: provider })
			const isReviewExists = await IsExists(Review, { task_id: task_id })

			if (!isProviderExists)
				return HandleError(res, 'Provider doesn\'t exists.')
			if (isReviewExists)
				return HandleError(res, 'You Already Reviewed!')

			let data = { rating, provider, username, feedback, task_id }

			let inserted = await Insert(Review, data)
			if (!inserted)
				return HandleError(res, 'Failed to send review. Please contact system admin.')

			/*
			 * Send Notification
			 */
				const isTaskExists = await IsExists(Task, { _id: task_id })
				
				Controllers.User.SendNotification({
					title:	'Task Reviewed',
					description: 'Your have got '+rating+' star for the task '+isTaskExists[0].title,
					user_id: provider,
					read: false,
					is_provider: true,
					push_id: isProviderExists[0].push_token
				})

			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /consumer/gettasks List Tasks Consumer
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
		try {
			const user_id = req.user_id || ''
			let validateError = ''

			if (user_id === '')
				validateError = 'This field is required.'

			if (validateError)
				return HandleError(res, validateError)
			let query = [
				{ $match: { consumer: Mongoose.Types.ObjectId(user_id) } },
				{ $sort: { createdAt: -1 } },
				{
					"$unwind": {
						"path": "$proposals",
						"preserveNullAndEmptyArrays": true
					}
				},
				{
					$lookup:
					{
						from: "users",
						let: { id: "$proposals.provider" },
						pipeline: [
							{
								$match: {
									"$expr": { "$eq": ["$_id", "$$id"] }
								}
							},
							{ $project: { access_token: 0, active_session_refresh_token: 0, 'provider.verification_document': 0 } },
							{
								$lookup:
									{ from: 'reviews', localField: '_id', foreignField: 'provider', as: 'reviews' }
							},
							{ $addFields: { average_rating: { $avg: '$reviews.rating' } } },
							{
								$lookup:
								{ 
									from: 'tasks',
									let: { provider_id: "$_id" },
									pipeline: [
										{
											$match: {
												$and: [
													{$expr: { $eq: [ '$provider', '$$provider_id' ] }},
													{$expr: { $eq: [ '$status', 'Completed' ] }}
												]
											}
											
										},
									],
									as: 'total_completed_task'
								}
							},
							{ $addFields: { total_completed_task: {$size:"$total_completed_task"} } },
							{
								$lookup:
									{ 
										from: 'tasks',
										let: { provider_id: "$_id" },
										pipeline: [
											{
												$match: {
													$and: [
														{$expr: { $eq: [ '$provider', '$$provider_id' ] }},
														{$expr: { $eq: [ '$status', 'Completed' ] }}
													]
												}
												
											},
											{ $sort: { createdAt: -1 } },
											{ $limit: 3 },
											{ $project: { title: 1, updatedAt: 1 } },
										],
										as: 'pastTask'
									}
							},
						],
						as: 'proposals.provider'
					}
				},
				{
					"$unwind": {
						"path": "$proposals.provider",
						"preserveNullAndEmptyArrays": true
					}
				},
				{
					$group: {
						_id: "$_id",
						cost: { "$first":"$cost" },
						provider: { "$first":"$provider" },
						images: { "$first":"$images" },
						title: { "$first": "$title" },
						service: { "$first": "$service" },
						description: { "$first": "$description" },
						instruction: { "$first": "$instruction" },
						name: { "$first": "$name" },
						mobile: { "$first": "$mobile" },
						status: { "$first": "$status" },
						address: { "$first": "$address" },
						location: { "$first": "$location" },
						consumer: { "$first": "$consumer" },
						landmark: { "$first": "$landmark" },
						houseno: { "$first": "$houseno" },
						proposals: { $push: "$proposals" },
						createdAt: { "$first":"$createdAt" },
						updatedAt: { "$first":"$updatedAt" }
					},
				},
				{ $sort: { createdAt: -1 } }
			]
			let data = await Aggregate(Task, query)

			if (!data.length)
				return HandleSuccess(res, [])

			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /provider/gettasks List Tasks Provider
	 * @apiName List Tasks Provider
	 * @apiGroup Task
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 */

	GetTasksProvider: async (req, res, next) => {
		try {
			const user_id = req.user_id || ''
			let validateError = ''

			if (user_id === '')
				validateError = 'This field is required.'

			if (validateError)
				return HandleError(res, validateError)
			
			const query = [
				{ $match: { provider: Mongoose.Types.ObjectId(user_id) } },
                {
                    $lookup:
                        { from: 'users', localField: 'provider', foreignField: '_id', as: 'provider_details' }
				},
				{
                    $lookup:
                        { from: 'users', localField: 'consumer', foreignField: '_id', as: 'consumer_details' }
				},
				{ $sort: { createdAt: -1 } }
            ]

			let data = await Aggregate(Task, query)
			
			if (!data.length)
				return HandleSuccess(res, [])

			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /provider/gettaskbyid Get Task By Id
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
		try {
			let _id = req.query.id || ''
			let validateError = ''

			if (_id === '')
				validateError = 'This field is required.'

			if (validateError)
				return HandleError(res, validateError)

			let data = await Find(Task, { _id: _id })

			if (!data)
				return HandleError(res, 'Failed to get Task.')

			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {post} /provider/set-cost Set Cost
	 * @apiName Set Cost
	 * @apiGroup Task
	 *
	 * @apiParam {ObjectId} task_id Id of the task.
	 * @apiParam {Number} service_cost Cost of the service.
	 * @apiParam {Number} other_cost Other Costs.
	 * @apiParam {Number} discount Discount value.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	*	{
		"status": "success",
		"data": {
			"location": {
				"type": "Point",
				"coordinates": [
					67.1027029,
					24.9335846
				]
			},
			"cost": {
				"service_cost": 100,
				"other_cost": 10,
				"discount": 0,
				"total": 108
			},
			"images": [],
			"_id": "5f89e197efa0471a92d71504",
			"title": "Looking for cook",
			"service": "Cook",
			"description": "Need cook",
			"instruction": "",
			"name": "Jay",
			"mobile": "112233448866",
			"status": "Hiring",
			"address": "Allama Shabbir Ahmed Usmani Road",
			"consumer": "5f89e0c3efa0471a92d71503",
			"landmark": "",
			"houseno": "",
			"proposals": [],
			"createdAt": "2020-10-16T18:08:23.898Z",
			"updatedAt": "2020-10-27T14:55:55.621Z",
			"__v": 0
		}
	}
	 *
	 */

	SetCost: async (req, res, next) => {
		try {
			const { task_id = '', service_cost = 0, other_cost = 0, discount = 0 } = req.body

			if (task_id == '')
				return HandleError(res, 'Invalid task id.')
			else if (service_cost && service_cost == 0)
				return HandleError(res, 'Service cost can not be zero.')

			const isTaskExists = await IsExists(Task, { _id: task_id })

			if (!isTaskExists)
				return HandleError(res, 'Task doesn\'t exists.')

			const total = parseInt(service_cost || 0) + parseInt(other_cost || 0) - parseInt(discount || 0);
			const where = { _id: task_id }
			const query = { 'cost.service_cost': service_cost, 'cost.other_cost': other_cost, 'cost.total': total  }

			let updated = await FindAndUpdate(Task, where, query)
			if (!updated)
				return HandleError(res, 'Failed to set cost.')

			// Realtime change
			RealtimeListener.inProgressTaskChange.emit('task-change',{task_id: task_id})

			return HandleSuccess(res, updated)
			

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	/**
	 * @api {get} /consumer/inprogress-order Get OrderDetails-Inprogress
	 * @apiName Get OrderDetails-Inprogress
	 * @apiGroup Task
	 *
	 * @apiParam {ObjectId} task_id Id of the task.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK

	 *	
	 {
		"status": "success",
		"data": {
			"service_cost": 100,
			"other_cost": 10
		}
	}
	 *
	 */

	GetOrderDetailsInProgress: async (req, res, next) => {
		try {
			const { task_id = '' } = req.query
			if (task_id == '')
				return HandleError(res, 'Invalid task id.')

			const isTaskExists = await IsExists(Task, { _id: task_id })

			if (!isTaskExists)
				return HandleError(res, 'Task doesn\'t exists.')

			const where = { _id: task_id }

			let data = await FindOne(Task, where)
			if (!data)
				return HandleError(res, 'Failed to get details.')

			return HandleSuccess(res, {service_cost: data.cost.service_cost, other_cost: data.cost.other_cost})
			

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

	InviteTask: async (req, res, next) => {
		try {
			const { provider_id = '' } = req.body
            const id = req.user_id || ''

			const isTaskExists = await IsExists(Task, { consumer: id, status: 'Hiring' })

			if (!isTaskExists)
				return HandleError(res, 'You Have No Opened Task Available.')

			/*
			 * Send Notification
			 */
			const isProviderExists = await IsExists(User, { _id: provider_id })

			if (!isProviderExists)
				return HandleError(res, 'Provider Not Exists.')

			Controllers.User.SendNotification({
				title:	'Task Invitation',
				description: 'A task is available near you. You are invited to send proposal!',
				user_id: provider_id,
				read: false,
				is_provider: true,
				push_id: isProviderExists[0].push_token
			})

			return HandleSuccess(res, {})
		} catch (err) {
			HandleServerError(res, req, err)
		}
	},

}