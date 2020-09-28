const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { SendSMS } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Chat } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL,GeneratePassword
} = require('./baseController');


module.exports = {
    
    ConnectionTest: async (socket,namespace) => {
		try {
            socket.emit('welcome', { message: 'Welcome!', id: socket.id });
            socket.on('i am client', console.log);
		
		} catch (err) {
			console.log(err)
		}
    },

    
}


