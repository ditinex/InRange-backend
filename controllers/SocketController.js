const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Chat } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL, GeneratePassword
} = require('./BaseController');

let realtimeTaskSocketsProviders = {}
let realtimeConsumerSockets = {}

module.exports = {

	Chat: async (socket) => {
		try {
			socket.on('startchat', async function(chat_id){
				const room_name = chat_id;
				socket.join(room_name);
				let updated = await FindAndUpdate(Chat,{_id: chat_id, "chats.seen": false},{"chats.$[].seen": true});
				socket.broadcast.to(room_name).emit('chathistory',updated.chats);
			});

			socket.on('message', async({chat_id,sender_id,receiver_id,message}) => {
				//Body
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
				if(updated)
					socket.broadcast.to(room_name).emit('updatechat',data);
			});

			socket.on('image', async({chat_id,sender_id,receiver_id,image_path}) => {
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
				if(updated)
					socket.broadcast.to(room_name).emit('updatechat',data);
			});

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
			socket.on('provider', (user_id) => {
				realtimeTaskSocketsProviders[user_id] = socket.id
			});

			socket.on('task_change', async (task_id) => {
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
						}
					},'_id')
					if(nearbyProviders){
						nearbyProviders = nearbyProviders.map(items=>items._id+'')
						nearbyProviders = nearbyProviders.filter(value => socketProviders.includes(value))
						nearbyProviders.forEach(element => {
							socket.nsp.to(realtimeTaskSocketsProviders[element]).emit('task_change',task)
						});
					}
				}
			});

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
			socket.on('consumer', (user_id) => {
				realtimeConsumerSockets[user_id] = socket.id
			});

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
					{ $lookup : 
						{ 
							from: 'tasks',
							as: 'tasks',
							let: { _id: '$_id' },
							pipeline: [
							  { $match: {
								$expr: { $eq: [ '$provider', '$$_id' ] }
							  } },
							  { $sort: { createdAt: -1 } },
							  { $limit: 3 }
							]}
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
							reviews: {rating: 1,feedback: 1,username: 1},
							average_rating: {$avg: '$reviews.rating'},
							distance: 1,
							tasks: {title: 1 ,updatedAt: 1}
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


}


