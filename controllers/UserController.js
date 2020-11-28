const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { SendSMS,RealtimeListener } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Notification } = require('../models')

const {
	IsExists, IsExistsOne, Insert, Find, CompressImageAndUpload, FindAndUpdate, UpdateMany, Delete,
	HandleSuccess, HandleError, HandleServerError, Aggregate,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL,GeneratePassword
} = require('./BaseController');
const Controllers = require('../controllers')

const { PushTextNotification } = require('./PushNotificationController');
const stripe = require('stripe')(Config.stripe_secret_key);

module.exports = {
    /**
	 * @api {put} /user/editprofile Edit Profile
	 * @apiName Edit Profile
	 * @apiGroup User
	 *
     * @apiParam {Number} mobile Users unique mobile with ISD code i.e 919903614705.
	 * @apiParam {String} name
	 * @apiParam {String} gender ENUM[male,female].
     * @apiParam {String} otp Need if mobile number is different.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
        {
            "status": "success",
            "data": {
                "otp": 1255
            }
        }
        // OR,
        {
            "status": "success",
            "data": {
                "location": {
                    "type": "Point",
                    "coordinates": [
                        88.1567362,
                        22.8258274
                    ]
                },
                "provider": {
                    "verification_document": "/images/1601093261125.jpg",
                    "service": "Truck",
                    "description": "Hello I a taxi driver"
                },
                "is_switched_provider": true,
                "is_available": true,
                "_id": "5f6e2d65afce8e1078f429fd",
                "name": "Captain America",
                "gender": "male",
                "mobile": "917003096982",
                "address": "",
                "status": "pending",
                "active_session_refresh_token": "cxi6IrWNcbA0F2bf",
                "profile_picture": "/images/1601056101315.jpg",
                "createdAt": "2020-09-25T17:48:21.450Z",
                "updatedAt": "2020-09-26T05:07:43.969Z",
                "__v": 0,
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNmUyZDY1YWZjZThlMTA3OGY0MjlmZCIsIm1vYmlsZSI6IjkxNzAwMzA5Njk4MiIsIm5hbWUiOiJDYXB0YWluIEFtZXJpY2EiLCJpYXQiOjE2MDEwOTY4MjQsImV4cCI6MTYwMTE4MzIyNH0.F_qDFd3Ze0kZAUGXrBG8ktDXvvmbljU3Bt5NUFY_aAI"
            }
        }
	*/

	EditProfile: async (req, res, next) => {
		try {
            const { name = '',gender = '' ,description='' ,service='' } = req.body
            const id = req.user_id || ''
            const profile_picture = req.files ? req.files.profile_picture : ''
            const verification_document = req.files ? req.files.verification_document : ''

			let validateError = null
            if (!ValidateAlphanumeric(name.trim()) || !ValidateLength(name.trim()))
				validateError = 'Please enter a valid name without any special character and less than 25 character.'
			else if (gender.trim() == '')
                validateError = 'Please select gender.'
            else if (id == '')
				validateError = 'Invalid id.'

			if (validateError)
                return HandleError(res, validateError)

            let isUserExists = await IsExists(User, { _id: id })
            let providerdata = isUserExists
            let data = providerdata[0]
            data.name = name
            data.gender = gender    

            if(!providerdata)
                return HandleError(res,"User not found.")

            if(profile_picture){
                isUploaded = await CompressImageAndUpload(profile_picture)
                if(!isUploaded)
                    return HandleError(res,"Failed to upload profile picture.")
                data.profile_picture = isUploaded.path
            }

            if(providerdata[0].is_switched_provider)
            {
                data.provider.description = description
                //checking for service if it is taxi or truck
                if(providerdata[0].provider.service!==service && (service === 'Taxi' || service === 'Truck'))
                {
                    data.status = 'pending'
                    if(!verification_document)
                        return HandleError(res,"You should give a verification document.")
                }
                data.provider.service = service
                
                if(verification_document){
                    isUploaded = await CompressImageAndUpload(verification_document)
                    if(!isUploaded)
                        return HandleError(res,"Failed to upload verification document.")
                    data.provider.verification_document = isUploaded.path
                }
            }
            if(isUserExists[0].name!=name)
            {
                let user = {... isUserExists[0]}
                data.active_session_refresh_token = GeneratePassword()
                data.access_token = jwt.sign({ id: user._id, mobile: user.mobile, name: name }, Config.secret, {
                    expiresIn: Config.tokenExpiryLimit // 86400 expires in 24 hours -- It should be 1 hour in production
                });
            }
            let updated = await FindAndUpdate(User, {_id: id}, data)
            if(!updated)
                return HandleError(res, 'Failed to update profile.')
            return HandleSuccess(res, updated)
                
		} catch (err) {
			HandleServerError(res, req, err)
		}

    },

    ChangeMobile: async (req, res, next) => {
		try {
			const { oldMobile = '', newMobile='',otp = '' } = req.body
            
            let validateError = null
            
			if (!ValidateMobile(newMobile.trim()))
                validateError = 'Please enter a valid mobile number with ISD code i.e 1990xxxxx05.'
                
			if (validateError)
                return HandleError(res, validateError)
                
                let expiry = new Date ();
                expiry.setMinutes ( expiry.getMinutes() - Config.otpExpiryLimit );
                
                if (otp) {
                    //Validate OTP and Login
                    let isOtpExists = await IsExists(Otp, { mobile: newMobile, otp: otp, createdAt: { $gt: expiry } })
 
                    let isUserExists = await IsExists(User, { mobile: oldMobile })
                    if(!isOtpExists)
                        return HandleError(res, 'Failed to verify OTP.')
                    else if(isOtpExists && isUserExists){
                        Delete(Otp,{ mobile: newMobile })
                        let user = {... isUserExists[0]}
                        const active_session_refresh_token = GeneratePassword()
                        const access_token = jwt.sign({ id: user._id, mobile: newMobile, name: user.name }, Config.secret, {
                            expiresIn: Config.tokenExpiryLimit // 86400 expires in 24 hours -- It should be 1 hour in production
                        });
            
                        let updated = await FindAndUpdate(User, {_id: user._id}, {mobile: newMobile, access_token: access_token, active_session_refresh_token: active_session_refresh_token})
                        if(!updated)
                            return HandleError(res, 'Failed to generate access token.')
                        return HandleSuccess(res, updated)
                    }
                }
                // Send OTP
                let isOtpExists = await IsExists(Otp, { mobile: newMobile, createdAt: { $gt: expiry } })
                if(isOtpExists)
                    return HandleError(res, 'Too many OTP requests. Please try after sometime.')
    
                const otpValue = Math.floor(1000 + Math.random() * 9000);
                let smsStatus = null
                if(Config.plivo_authid)
                    smsStatus = await SendSMS('+'+newMobile,'Your InRangeIt One Time Password is '+otpValue)
                if(smsStatus && smsStatus.errorMessage)
                    return HandleError(res, 'Failed to send OTP. Please contact system admin.')
                const inserted = await Insert(Otp,{otp: otpValue, mobile: newMobile})
                if(!inserted)
                    return HandleError(res, 'Failed to send OTP.')
                return HandleSuccess(res, { otp: otpValue })

		} catch (err) {
			HandleServerError(res, req, err)
		}
    },

    /**
	 * @api {put} /user/changeprofilepic Change Profile Pic
	 * @apiName Change Profile Pic
	 * @apiGroup User
	 *
	 * @apiParam {File} profile_picture Picture to change.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
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
                "provider": {
                    "verification_document": null,
                    "service": "",
                    "description": ""
                },
                "is_switched_provider": false,
                "is_available": true,
                "_id": "5f67ac2e9a599b177fba55b5",
                "name": "Demo",
                "gender": "male",
                "mobile": "919903614706",
                "address": "kjhkd kjdhfbk",
                "status": "approved",
                "active_session_refresh_token": "5OwDBqzHLUFj54TJ",
                "profile_picture": "/images/1601090029587.jpg",
                "createdAt": "2020-09-20T19:23:26.855Z",
                "updatedAt": "2020-09-26T03:13:49.600Z",
                "__v": 0,
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjdhYzJlOWE1OTliMTc3ZmJhNTViNSIsIm1vYmlsZSI6IjkxOTkwMzYxNDcwNiIsIm5hbWUiOiJEZW1vIiwiaWF0IjoxNjAwNjMyMDgxLCJleHAiOjE2MDA3MTg0ODF9.Uj642GC9-b_dkoTR1lrq2Z3PouybDz1Q-gzAw2TRCCI"
            }
        }
	*/

	ChangeProfilePic: async (req, res, next) => {
		try {
            const id = req.user_id || ''
            const profile_picture = req.files?req.files.profile_picture : ''
            let validateError = null
			//Check service & verifydoc form submission in frontend
			if (!profile_picture)
                validateError = 'Please upload a profile picture.'
            else if (id == '')
				validateError = 'Invalid id.'

			if (validateError)
				return HandleError(res, validateError)
            let data = {}

			let isUploaded = await CompressImageAndUpload(profile_picture)
			if(!isUploaded)
				return HandleError(res,"Failed to upload profile pic.")
			data.profile_picture = isUploaded.path

			let updated = await FindAndUpdate(User, {_id: id}, data)
			if(!updated)
				return HandleError(res, 'Failed to update profile pic.')

			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
    },
    
    /**
	 * @api {put} /user/switchprofile Switch Profile
	 * @apiName Switch Profile
	 * @apiGroup User
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
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
                "provider": {
                    "verification_document": null,
                    "service": "",
                    "description": ""
                },
                "is_switched_provider": false,
                "is_available": true,
                "_id": "5f67ac2e9a599b177fba55b5",
                "name": "Demo",
                "gender": "male",
                "mobile": "919903614706",
                "address": "kjhkd kjdhfbk",
                "status": "approved",
                "active_session_refresh_token": "5OwDBqzHLUFj54TJ",
                "profile_picture": "/images/1600629806826.jpg",
                "createdAt": "2020-09-20T19:23:26.855Z",
                "updatedAt": "2020-09-26T00:15:53.977Z",
                "__v": 0,
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjdhYzJlOWE1OTliMTc3ZmJhNTViNSIsIm1vYmlsZSI6IjkxOTkwMzYxNDcwNiIsIm5hbWUiOiJEZW1vIiwiaWF0IjoxNjAwNjMyMDgxLCJleHAiOjE2MDA3MTg0ODF9.Uj642GC9-b_dkoTR1lrq2Z3PouybDz1Q-gzAw2TRCCI"
            }
        }
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 202 Error
        {
            "status": "failed",
            "error": "All pending tasks should be completed to switch profile."
        }
	*/

	SwitchProfile: async (req, res, next) => {
		try {
            const id = req.user_id || ''

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

            let data = await Aggregate(Task,query)

            let userdata = await Find(User, {_id: id})
            if(!userdata)
                return HandleError(res, 'User not found.')

            if(data.length==0)
            {
                let updated = await FindAndUpdate(User, {_id: id}, {is_switched_provider: !userdata[0].is_switched_provider})
                if(!updated)
                    return HandleError(res, 'Failed to switch provider.')
                
                /*
                * Creating an event provider_change in self socket to server realtime database via socket
                */
                if(updated.is_switched_provider)
                    RealtimeListener.providerChange.emit('provider_change',updated._id)

			    return HandleSuccess(res, updated)
            }
            else HandleError(res, 'All pending tasks should be completed to switch profile.')
		
		} catch (err) {
			HandleServerError(res, req, err)
		}
    },

    /**
	 * @api {put} /user/editproviderprofile Edit Provider Profile
	 * @apiName Edit Provider Profile
	 * @apiGroup User
	 *
	 * @apiParam {String} service Provider service type.
	 * @apiParam {File} verification_document Certificate is mandatory for taxi or truck service.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
        {
            "status": "success",
            "data": {
                "location": {
                    "type": "Point",
                    "coordinates": [
                        88.1567362,
                        22.8258274
                    ]
                },
                "provider": {
                    "verification_document": "/images/1601093261125.jpg",
                    "service": "Truck",
                    "description": "Hello I a truck driver"
                },
                "is_switched_provider": true,
                "is_available": true,
                "_id": "5f6e2d65afce8e1078f429fd",
                "name": "Demo Provider",
                "gender": "female",
                "mobile": "919804315065",
                "address": "",
                "status": "pending",
                "active_session_refresh_token": "0jmxzffnLD4kCsWD",
                "profile_picture": "/images/1601056101315.jpg",
                "createdAt": "2020-09-25T17:48:21.450Z",
                "updatedAt": "2020-09-26T04:07:41.157Z",
                "__v": 0,
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNmUyZDY1YWZjZThlMTA3OGY0MjlmZCIsIm1vYmlsZSI6IjkxOTgwNDMxNTA2NSIsIm5hbWUiOiJEZW1vIFByb3ZpZGVyIiwiaWF0IjoxNjAxMDU2MTAxLCJleHAiOjE2MDExNDI1MDF9.lPo1kHgYGxJXV4Ainod1twFKbXwlcbtmaNFGgiobcCg"
            }
        }
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 202 Error
        {
            "status": "failed",
            "error": "You should give a verification document."
        }
	*/

	EditProviderProfile: async (req, res, next) => {
		try {
            const { service = '',description ='' } = req.body
			const id = req.user_id || ''
            const verification_document = req.files?req.files.verification_document : null
            let validateError = null
			//Check service & verifydoc form submission in frontend
			if (id == '')
                validateError = 'Please give a valid id.'
            else if(service =='')
                validateError = 'Service type cannot be empty.'

            let providerdata = await Find(User,{_id: id})
            if(!providerdata)
                return HandleError(res,"User not found.")
            
			if (validateError)
				return HandleError(res, validateError)
            let data = providerdata[0]
            data.provider.description = description
            //checking for service if it is taxi or truck
            if(providerdata[0].provider.service!==service && (service === 'Taxi' || service === 'Truck'))
            {
                data.status = 'pending'
                if(!verification_document)
                    return HandleError(res,"You should give a verification document.")
            }
            data.provider.service = service
            
            if(verification_document){
                data.status = 'pending'
				isUploaded = await CompressImageAndUpload(verification_document)
				if(!isUploaded)
					return HandleError(res,"Failed to upload verification document.")
				data.provider.verification_document = isUploaded.path
			}

			let updated = await FindAndUpdate(User, {_id: id}, data)
			if(!updated)
				return HandleError(res, 'Failed to update profile.')

			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
    },

    /**
	 * @api {put} /user/updatelocation Update Location
	 * @apiName Update Location
	 * @apiGroup User
	 *
	 * @apiParam {String} location JSON stringify string with coordinates i.e {"longitude":"-110.8571443","lattitude":"32.4586858"}.
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
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
                "provider": {
                    "verification_document": "/images/1601093261125.jpg",
                    "service": "Truck",
                    "description": "Hello I a taxi driver"
                },
                "is_switched_provider": true,
                "is_available": true,
                "_id": "5f6e2d65afce8e1078f429fd",
                "name": "Captain America",
                "gender": "male",
                "mobile": "919804985304",
                "address": "india",
                "status": "pending",
                "active_session_refresh_token": "XsHAdWYVc2kRKCPq",
                "profile_picture": "/images/1601056101315.jpg",
                "createdAt": "2020-09-25T17:48:21.450Z",
                "updatedAt": "2020-09-30T15:45:17.386Z",
                "__v": 0,
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNmUyZDY1YWZjZThlMTA3OGY0MjlmZCIsIm1vYmlsZSI6IjkxOTgwNDk4NTMwNCIsIm5hbWUiOiJDYXB0YWluIEFtZXJpY2EiLCJpYXQiOjE2MDE0ODA2NTgsImV4cCI6MTYwMTU2NzA1OH0.lxtj5Ftub-EYx1XE25DjSJW7J0U48r6O2fizyw-IUkk"
            }
        }
    */
    
    UpdateLocation: async (req, res, next) => {
		try {
            const { location ='' } = req.body
            const id = req.user_id || ''
            
            let validateError = null
			//Check service & verifydoc form submission in frontend
			if (id == '')
                validateError = 'Please give a valid id.'
            else if(location =='')
                validateError = 'location cannot be empty.'
            
			if (validateError)
                return HandleError(res, validateError)
            
            let coordinates = {}
            try {
                coordinates = JSON.parse(location)
            }
            catch (e) {
                return HandleError(res, 'Invalid location cooridnates.')
            }

			let updated = await FindAndUpdate(User, {_id: id}, {location: { type: 'Point', coordinates: [coordinates.longitude, coordinates.lattitude] }})
			if(!updated)
                return HandleError(res, 'Failed to update location.')
			
			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
    },

    /**
	 * @api {put} /user/updatepushtoken Set Notification Token
	 * @apiName Set Notification Token
	 * @apiGroup Auth
	 *
	 * @apiParam {String} push_token Token of the device.
	 * @apiParam {String} push_id Push Id of the user.
	 *
	 *
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     
	 *
	 */

	UpdatePushToken: async (req, res, next) => {
		try {
			const { push_token='', push_id='' } = req.body
			// console.log(req.body)
			const id = req.user_id || ''
			if(!push_token.trim() || !push_id.trim())
				return HandleError(res, 'Invalid id or token.')

			const push = { push_token: push_token, push_id: push_id }

			let updated = await FindAndUpdate(User, { _id: id }, { push_notification: push })
			if (!updated)
				return HandleError(res, 'Failed to set notification token.')

			return HandleSuccess(res, updated)

		} catch (err) {
			HandleServerError(res, req, err)
		}
    },

    GetNotificationList: async (req, res, next) => {
		try {
			let id = req.user_id || ''
			let validateError = ''

			if (id === '')
				validateError = 'This field is required.'

            if (validateError)
                return HandleError(res, validateError)

            const user = await IsExistsOne(User, { _id: id })
            if (!user)
                return HandleError(res, 'User doesn\'t exists.')

			let data = await Find(Notification, { user_id: id, is_provider: user.is_switched_provider },{},{ createdAt: -1 })
            if (!data)
				return HandleError(res, 'Failed to get List.')

			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
    },

    ReadNotification: async (req, res, next) => {
        try {
            const id = req.user_id || ''

            let validateError = null
            if (id == '')
                validateError = 'Invalid id.'

            if (validateError)
                return HandleError(res, validateError)

            const user = await IsExistsOne(User, { _id: id })
            if (!user)
                return HandleError(res, 'User doesn\'t exists.')

            let updated = await UpdateMany(Notification, { user_id: id, is_provider: user.is_switched_provider, read: false },{read: true});
            // if (!updated)
                // return HandleError(res, 'Failed to read the notifications.')

            return HandleSuccess(res, updated)

        } catch (err) {
            HandleServerError(res, req, err)
        }
    },
    
    UnreadNotificationCount: async (req, res, next) => {
        try {
            const id = req.user_id || ''

            let validateError = null
            if (id == '')
                validateError = 'Invalid id.'

            if (validateError)
                return HandleError(res, validateError)

            const user = await IsExistsOne(User, { _id: id })
            if (!user)
                return HandleError(res, 'User doesn\'t exists.')

            let data = await Find(Notification, { user_id: id, is_provider: user.is_switched_provider, read: false },{},{ createdAt: -1 })
            if (!data)
                return HandleError(res, 'Failed to count!')
            return HandleSuccess(res, {count: data.length})

        } catch (err) {
            HandleServerError(res, req, err)
        }
    },

    SendNotification: async(data) => {
        try {
            let inserted = await Insert(Notification, data)
            if (!inserted)
                return false   
            /*
			 * Push Notification
			 */
			Controllers.PushNotification.PushTextNotification(
				data.title,
                data.description,
                [data.push_id]
			)
            
            return true;
        }catch (err) {

        }
    },

    DoPayment: async(req, res, next) => {
        try {
            let task_id = (req.body.task_id) ? req.body.task_id : ''
            let payment_method = (req.body.payment_method) ? req.body.payment_method : ''
            let validateError = ''
            let paid = null;
            if (task_id === '')
                validateError = 'This field is required.'

            if (validateError)
                return HandleError(res, validateError)

            if(payment_method == 'By Cash')
            {
                paid = true
            }
            else await stripe.customers.create({
                email: 'YOUR_EMAILtest@test.com',
                name: 'Jenny Rosen',
                address: {
                    line1: '510 Townsend St',
                    postal_code: '98140',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'US',
                },
                source: req.body.tokenId
              })
            .then(async customer => {
                const result = await stripe.charges.create({
                  amount: req.body.amount*100,
                  currency: 'USD',
                  customer: customer.id,
                  source: customer.default_source.id,
                  description: 'Test payment',
                })
                if(result)
                    paid = true
            })
            .catch(error => {
                return HandleError(res, error.raw.message)
            })

            if(paid)
                {
                    let where = { _id: task_id }
                    let data = { status: 'Completed', "cost.paymentmethod": payment_method }

                    let updated = await FindAndUpdate(Task, where, data)
                    if (!updated)
                        return HandleError(res, 'Failed to complete task. Please contact system admin.')
                    // Realtime change
                    RealtimeListener.inProgressTaskChange.emit('task-change',{task_id: updated._id})
                    /*
                    * Send Notification
                    */

                        Controllers.User.SendNotification({
                            title:	'Task Completed',
                            description: 'The task '+updated.title+' has been successfully completed.',
                            user_id: updated.consumer,
                            read: false,
                            is_provider: false
                        })
                        Controllers.User.SendNotification({
                            title:	'Payment Completed',
                            description: 'Payment for the task '+updated.title+' has been successfully completed.',
                            user_id: updated.provider,
                            read: false,
                            is_provider: true
                        })
                    return HandleSuccess(res, updated);
		
            }
        }catch (err) {
            HandleServerError(res, req, err)
        }
    }
    
}


