const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { SendSMS,RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Notification } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL,GeneratePassword
} = require('./BaseController');

var FCM = require('fcm-node');
var serverKey = 'YOURSERVERKEYHERE';
var fcm = new FCM(serverKey);


module.exports = {

	UpdateToken: async (token,user_id) => {
		try {

			if (token == '')
				return false;

			const where = { user_id: user_id }
			const query = { firetoken: token }

			let updated = await FindAndUpdate(Notification, where, query)
			if (!updated)
				return false;

			return true;

		} catch (err) {
		}
	},
	
	SendNotification: async (tokenlist,noti_title,noti_body,noti_image) => {
		try {
            var message = { 
				registration_ids: tokenlist,
				// to: 'registration_token', 
				collapse_key: 'your_collapse_key',
				
				notification: {
					title: noti_title, 
					body: noti_body,
					// image: noti_image
				},
				
				// data: {
				// 	my_key: 'my value',
				// 	my_another_key: 'my another value'
				// }
			};
			fcm.send(message, function(err, response){
				if (err) {
					console.log("Something has gone wrong!");
					return false;
				} else {
					console.log("Successfully sent with response: ", response);
					return response;
				}
			});

		} catch (err) {
		}
	}
}


