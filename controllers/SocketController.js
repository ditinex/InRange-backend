const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Chat } = require('../models')
const Controllers = require('../controllers')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL, GeneratePassword, FindOne
} = require('./BaseController');

const {
    PushMessage
} = require('./PushNotificationController');

let realtimeTaskSocketsProviders = {}
let realtimeConsumerSockets = {}

module.exports = {

	Chat: async (socket,io) => {
		try {

			/**
			 * @api {socket} startchat Start Chat
			 * @apiName Start Chat
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} chat_id Id of the chat.
			 * @apiParam {ObjectId} user_id Id of the user.
			 *
			*/
			socket.on('startchat', async function(chat_id,user_id){
				const room_name = chat_id;
				socket.join(room_name);
				let updated = await FindAndUpdate(Chat,{_id: chat_id,"chats.receiver_id": user_id, "chats.seen": false},{"chats.$[].seen": true});
				let chatList = await Find(Chat,{_id: chat_id},{},{ 'chats.createdAt': -1 },50);
				socket.emit('chathistory',chatList[0].chats);

			});

			/**
			 * @api {socket} message Send Message
			 * @apiName Send Message
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} chat_id Id of the chat.
			 * @apiParam {ObjectId} serder_id Id of the sender user.
			 * @apiParam {ObjectId} receiver_id Id of the receiver user.
			 * @apiParam {String} message Message text.
			 *
			*/

			socket.on('send_message', async({chat_id,sender_id,receiver_id,message}) => {
				console.log(sender_id)
				const room_name = chat_id;
				let data = {
					sender_id: sender_id,
					receiver_id: receiver_id,
					message: message,
					seen: false
				}

				const where = { _id: chat_id }
				const query = { $push: { chats: data}}

				let updated = await FindAndUpdate(Chat,where,query,true)
				if(updated){
					if(Object.keys(io.of("/chat").in(room_name).connected).length > 1)
						socket.broadcast.to(room_name).emit('message',data);
					else{
						const user = await IsExists(User, { _id: receiver_id })
						
						if(user[0].push_notification)
						Controllers.PushNotification.PushMessage(
							'1 New Message',
							message,
							[user[0].push_notification.push_id],
							sender_id
						)
					}
				}
			});

			/**
			 * @api {socket} image Send Image
			 * @apiName Send Image
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} chat_id Id of the chat.
			 * @apiParam {ObjectId} serder_id Id of the sender user.
			 * @apiParam {ObjectId} receiver_id Id of the receiver user.
			 * @apiParam {String} image_path Image path.
			 *
			*/

			socket.on('send_image', async({chat_id,sender_id,receiver_id,image_path}) => {
				//Upload the image via api call first then send socket data with image id
				const room_name = chat_id;

				let data = {
					sender_id: sender_id,
					receiver_id: receiver_id,
					image: image_path,
					seen: false
				}

				const where = { _id: chat_id }
				const query = { $push: { chats: data}}

				let updated = await FindAndUpdate(Chat,where,query,true)
				if(updated){
					if(Object.keys(io.of("/chat").in(room_name).connected).length > 1)
						socket.broadcast.to(room_name).emit('message',data);
					else{
						const user = await IsExists(User, { _id: receiver_id })
						
						if(user[0].push_notification)
						Controllers.PushNotification.PushMessage(
							'1 New Image',
							"",
							[user[0].push_notification.push_id],
							sender_id
						)
					}
				}
			});

			/**
			 * @api {socket} seen Seen Message
			 * @apiName Seen Message
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} chat_id Id of the chat.
			 * @apiParam {ObjectId} msg_id Id of the message.
			 *
			*/

			socket.on('seen', async({chat_id,msg_id}) => {
				let updated = await FindAndUpdate(Chat,{_id: chat_id, "chats._id": msg_id},{"chats.$.seen": true});
			});

		} catch (err) {
			console.log(err)
		}
	},

	RealtimeTask: async (socket) => {
		/*
		 * On creating new task or on task status change an event 'task_change' is sent from respective api  * via self socket helper.
		 * On new provider browsing dashboard, the provider id and its socket id is stored in 
		 * realtimeTaskSocketsProviders. On disconnect, remove the entry
		 * On task_change event, the changed data is emitted to all the nearest provider connected within 10KM
		 */
		try {

			/**
			 * @api {socket} provider Store provider
			 * @apiName Store provider
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} user_id Id of the user.
			 *
			*/
			socket.on('provider', (user_id) => {
				realtimeTaskSocketsProviders[user_id] = socket.id
			});

			/**
			 * @api {socket} task_change Realtime task change listner
			 * @apiName Realtime task
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} task_id Id of the task.
			 *
			*/
			socket.on('task_change', async (task_id,task_service,type) => {
				let task = await IsExists(Task, { _id: task_id })
				if (task) {
					task = task[0]
					let socketProviders = Object.keys(realtimeTaskSocketsProviders)
					let nearbyProviders = await Find(User, {
						location: {
							$near: {
								$maxDistance: Config.max_map_range,
								$geometry: {
									type: "Point",
									coordinates: [task.location.coordinates[0], task.location.coordinates[1]]
								}
							}
						},
						"provider.service": task_service,
					},'_id')
					if(nearbyProviders){
						nearbyProviders = nearbyProviders.map(items=>items._id+'')
						nearbyProviders = nearbyProviders.filter(value => socketProviders.includes(value))
						
						nearbyProviders.forEach(async element => {
							const isProviderExists = await IsExists(User, { _id: element })
							if(isProviderExists && isProviderExists[0].push_notification && type!=='cancel')
								Controllers.User.SendNotification({
									title:	'Available Task Nearby!',
									description: 'Check Your Dashboard To Catch It!',
									user_id: element,
									read: false,
									is_provider: true,
									push_id: isProviderExists[0].push_notification.push_id
								})

							socket.nsp.to(realtimeTaskSocketsProviders[element]).emit('task_change',task)
						});
					}
				}
			});

			/**
			 * @api {socket} fetch_available_task Fetch task
			 * @apiName Fetch task
			 * @apiGroup Socket
			 *
			 * @apiParam {Object} location Location to fetch nearby tasks.
			 * @apiParam {ObjectId} type Type of service.
			 *
			*/
			socket.on('fetch_available_task',async ({location,type})=>{
				let tasks = await Find(Task,{
					location: {
						$near: {
							$maxDistance: Config.max_map_range,
							$geometry: {
								type: "Point",
								coordinates: [location.longitude,location.latitude]
							}
						}
					},
					service: type,
					status: { $in: ['Hiring','In-progress'] }
				})
				if(tasks && tasks.length > 0){
					socket.emit('available_task',tasks)
				}
			})

			socket.on('disconnect',async ()=>{
				let arr = Object.keys(realtimeTaskSocketsProviders)
				for(let i=0; i<arr.length; i++){
					if(realtimeTaskSocketsProviders[arr[i]]==socket.id){	
						delete realtimeTaskSocketsProviders[arr[i]]
						break;
					}
				}
			})

			/**
			 * @api {socket} change_location Change location
			 * @apiName Change location
			 * @apiGroup Socket
			 *
			 * @apiParam {Object} location Location to change [longitude,latitude].
			 * @apiParam {ObjectId} user Id of the user
			 *
			*/
			socket.on('change_location',async ({location,user})=>{
				let updated = await FindAndUpdate(User,{_id: user},{'location.coordinates': [location.longitude,location.latitude]})
				RealtimeListener.providerChange.emit('provider_change',user)
			})

		} catch (err) {
			console.log(err)
		}
	},

	RealtimeProvider: async (socket) => {
		/*
		 * On new provider available or on proposal accept or provider edit profile or location change an event 'provider_change' is sent from respective api  * via self socket helper.
		 * On new consumer browsing dashboard, the consumer id and its socket id is stored in 
		 * realtimeConsumerSockets. On disconnect, remove the entry
		 * On provider_change event, the changed data is emitted to all the nearest consumer connected within 10KM
		 */
		try {

			/**
			 * @api {socket} consumer Store consumer
			 * @apiName Store consumer
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} user Id of the user
			 *
			*/
			socket.on('consumer', (user_id) => {
				realtimeConsumerSockets[user_id] = socket.id
			});

			/**
			 * @api {socket} provider_change Realtime provider change listner
			 * @apiName Realtime provider
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} user_id Id of the user.
			 *
			*/
			socket.on('provider_change', async (user_id) => {
				let provider = await IsExists(User, { _id: user_id })
				if (provider) {
					provider = provider[0]
					let socketConsumers = Object.keys(realtimeConsumerSockets)
					let nearbyConsumers = await Find(User, {
						location: {
							$near: {
								$maxDistance: Config.max_map_range,
								$geometry: {
									type: "Point",
									coordinates: [provider.location.coordinates[0], provider.location.coordinates[1]]
								}
							}
						}
					},'_id')
					if(nearbyConsumers){
						nearbyConsumers = nearbyConsumers.map(items=>items._id+'')
						nearbyConsumers = nearbyConsumers.filter(value => socketConsumers.includes(value))
						nearbyConsumers.forEach(element => {
							socket.nsp.to(realtimeConsumerSockets[element]).emit('provider_change',provider)
						});
					}
				}
			});

			/**
			 * @api {socket} fetch_all_providers Fetch providers
			 * @apiName Fetch providers
			 * @apiGroup Socket
			 *
			 * @apiParam {Object} location Location to fetch nearby providers.
			 *
			*/
			socket.on('fetch_all_providers',async ({location})=>{
				const query = [
					{ $geoNear: {
						near: {
							type: "Point",
							coordinates: [location.longitude,location.latitude]
						},
						distanceField: "distance",
						spherical: true,
						maxDistance: Config.max_map_range,
					}},
					{ $match: { is_switched_provider: true }},
					{ $lookup : 
						{ from: 'reviews', localField: '_id', foreignField: 'provider', as: 'reviews' }
					},
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
					{ $lookup : 
						{ 
							from: 'tasks',
							as: 'pastTask',
							let: { id: '$_id' },
							pipeline: [
							{ $match: {
								$and: [
									{$expr: { $eq: [ '$provider', '$$id' ] }},
									{$expr: { $eq: [ '$status', 'Completed' ] }}
								]
							} 
							},
							{ $sort: { createdAt: -1 } },
							{ $limit: 3 }
							]
						}
					},
					{ $project:
						{ 
							mobile: 1,
							name: 1,
							profile_picture: 1,
							gender: 1,
							status: 1,
							is_switched_provider: 1,
							address: 1,
							is_available: 1,
							location: 1,
							'provider.service': 1,
							'provider.description': 1,
							reviews: {feedback: 1,username: 1},
							rating: {$avg: '$reviews.rating'},
							distance: 1,
							pastTask: {title: 1 ,updatedAt: 1},
							total_completed_task: 1
						}
					}
				]
	
				let providers = await Aggregate(User,query)
				if(providers && providers.length > 0){
					socket.emit('available_providers',providers)
				}
			})

			socket.on('disconnect',async ()=>{
				let arr = Object.keys(realtimeConsumerSockets)
				for(let i=0; i<arr.length; i++){
					if(realtimeConsumerSockets[arr[i]]==socket.id){	
						delete realtimeConsumerSockets[arr[i]]
						break;
					}
				}
			})

		} catch (err) {
			console.log(err)
		}
	},

	RealtimeInprogressTask: async (socket) => {
		try {

			/**
			 * @api {socket} start-tracker Get Tracking Location
			 * @apiName Get Tracking Location
			 * @apiGroup Socket
			 *
			 * @apiParam {ObjectId} task_id Id of the task
			 *
			*/
			socket.on('join-tracking-room', async function(task_id){
				const room_name = task_id;
				socket.join(room_name);
				//
				const getAddressQuery = [
					{
						$match: { _id: Mongoose.Types.ObjectId(task_id) }
					},
					{
						$lookup:
							{ from: 'users', localField: 'provider', foreignField: '_id', as: 'provider' }
					}
				]
				const data = await Aggregate(Task, getAddressQuery)

				const locationData = {provider_coordinates: data[0].provider[0].location.coordinates}
				socket.to(task_id).emit('provider-location',locationData);
			});

			/**
			 * @api {socket} change-provider-location Realtime Provider location
			 * @apiName Realtime Provider location
			 * @apiGroup Socket
			 *
			 * @apiParam {Object} location Location to change [longitude,latitude].
			 * @apiParam {ObjectId} provider_id Id of the provider
			 * @apiParam {ObjectId} task_id Id of the task
			 *
			*/
			socket.on('change-provider-location',async ({location,provider_id,task_id})=>{
				let updated = await FindAndUpdate(User,{_id: provider_id},{'location.coordinates': [location.longitude,location.latitude]})
				const updatedLoc = [location.longitude,location.latitude];
				socket.to(task_id).emit('provider-location', updatedLoc);
			});

			socket.on('task-change',async ({task_id})=>{
				const query = [
					{ $match: { _id: Mongoose.Types.ObjectId(task_id) } },
					{
						$lookup:
							{ from: 'users', localField: 'provider', foreignField: '_id', as: 'provider_details' }
					},
					{
						$lookup:
							{ from: 'users', localField: 'consumer', foreignField: '_id', as: 'consumer_details' }
					}
				]
	
				let data = await Aggregate(Task, query)
				if(data.length>0)
					socket.to(task_id).emit('updated-task', data[0]);
			});

		} catch (err) {
			console.log(err)
		}
	}
}


