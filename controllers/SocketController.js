const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { Admin, Otp, User, Task, Mongoose, Review, Chat } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL, GeneratePassword
} = require('./BaseController');

let realtimeTaskSocketsProviders = {}

module.exports = {

	Chat: async (socket) => {
		try {
			socket.on('message', ({sender_id,receiver_id,message}) => {
				//Body
			});
			socket.on('image', ({sender_id,receiver_id,image_id}) => {
				//Upload the image via api call first then send socket data with image id
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
			})

		} catch (err) {
			console.log(err)
		}
	},


}


