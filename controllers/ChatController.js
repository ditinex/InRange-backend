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
    
    GetChatList: async (req, res, next) => {
		try {
            const id = req.user_id

			//Check service & verifydoc form submission in frontend
            let validateError = null
            if (id == '')
                validateError = 'Invalid id.'

			if (validateError)
				return HandleError(res, validateError)

            const query = [
                { $match: { $or: [{ provider: Mongoose.Types.ObjectId(id) }, { consumer: Mongoose.Types.ObjectId(id) }] } },
                { $match: { status: { $nin: [ 'Completed', 'Cancelled' ] }}},
                { $project:
                    { 
                        _id: 1,
                    }
                }
            ]

            let data = await Aggregate(Chat,query)
            if(!data)
                    return HandleError(res, 'No Data Found.')
            return HandleSuccess(res, data)
		
		} catch (err) {
			HandleServerError(res, req, err)
		}

    },

    GetMessages: async (req, res, next) => {
		

    },

	SendMessage: async (req, res, next) => {
		

    },

    ReadMessage: async (req, res, next) => {
		

    },
}


