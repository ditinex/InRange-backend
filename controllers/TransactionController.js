const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { SendSMS,RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Notification, Transaction } = require('../models')

const {
	IsExists, IsExistsOne,Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL,GeneratePassword
} = require('./BaseController');


module.exports = {

    AddTransaction: async ( provider_id, task_id, amount, type, description) => {
		try {
			let validateError = null
			if (provider_id == '' || task_id == '')
				validateError = 'Invalid id.'
            else if (amount == '')
                validateError = 'Amount should be greater than 0.'
            else if (type == '')
                validateError = 'Type can not be blank.'

			if (validateError)
                return false
                
            const isProviderExists = await IsExistsOne(User, { _id: provider_id })
            if (!isProviderExists)
                return false
            
			let balance = isProviderExists.provider.wallet_balance
			let status;
			if(!balance)
				balance = 0
            if(type == 'Cr')
			{
				balance = balance + amount
				status = 'Completed'
			}
            else{
                if(balance<amount)
                    return HandleError(res, 'Balance is less than the withdraw request.')
                else{
					balance = balance - amount
					status = 'Pending'
				}
            }

			let data = { provider_id, task_id, amount, type, description, status }

			let inserted = await Insert(Transaction, data)
			if (!inserted)
				return false
            
            let updated = await FindAndUpdate(User, {_id: provider_id}, {'provider.wallet_balance': balance})
                if (!updated)
                    return false
			return true

		} catch (err) {
			return false
		}
    },
    
    GetTransactionList: async (req, res, next) => {
		try {
			const user_id = req.user_id || ''
			let validateError = ''

			if (user_id === '')
				validateError = 'This field is required.'

			if (validateError)
				return HandleError(res, validateError)
			
			const query = [
				{ $match: { provider_id: Mongoose.Types.ObjectId(user_id) } },
				{ $sort: { createdAt: -1 } }
            ]

			let data = await Aggregate(Transaction, query)
			
			if (!data.length)
				return HandleSuccess(res, [])

			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},
    
}