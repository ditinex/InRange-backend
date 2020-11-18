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

    AddTransaction: async (req, res, next) => {
		try {
			const { provider_id = '', task_id = '', amount = 0, type = '', description = '' } = req.body

			let validateError = null
			if (provider_id == '' || task_id == '')
				validateError = 'Invalid id.'
            else if (amount == '')
                validateError = 'Amount should be greater than 0.'
            else if (type == '')
                validateError = 'Type can not be blank.'

			if (validateError)
                return HandleError(res, validateError)
                
            const isProviderExists = await IsExistsOne(User, { _id: provider_id })
            if (!isProviderExists)
                return HandleError(res, 'Provider doesn\'t exists.')
            
            let balance = isProviderExists.provider.wallet_balance
            if(type == 'Cr')
                balance = balance + amount
            else{
                if(balance<amount)
                    return HandleError(res, 'Balance is less than the withdraw request.')
                else 
                    balance = balance - amount
            }

			let data = { provider_id, task_id, amount, type, description }

			let inserted = await Insert(Transaction, data)
			if (!inserted)
				return HandleError(res, 'Failed to add transaction. Please contact system admin.')
            
            let updated = await FindAndUpdate(Transaction, {_id: provider_id}, {'provider.wallet_balance': balance})
                if (!updated)
                    return HandleError(res, 'Failed to add transaction. Please contact system admin.')
			return HandleSuccess(res, inserted)

		} catch (err) {
			HandleServerError(res, req, err)
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