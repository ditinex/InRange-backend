const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { SendSMS } = require('../services')
const { Admin, Otp, User, Task, Mongoose, Review, Chat } = require('../models')

const {
    IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
    HandleSuccess, HandleError, HandleServerError, Aggregate,
    ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL, GeneratePassword
} = require('./BaseController');


module.exports = {

    /**
     * @api {get} /user/getchatlist Get Chatlist
     * @apiName Get Chatlist
     * @apiGroup Chat
     *
     * @apiParam {ObjectId} id Id of the user.
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK

        {
            "status": "success",
            "data": [
                {
                    "_id": "5f727e6544f33432a4b498e9",
                    "consumer_id": "5f6e2d65afce8e1078f429fd",
                    "provider_id": "5f67ac2e9a599b177fba55b5",
                    "chats": [
                        {
                            "seen": false,
                            "_id": "5f727e6544f33432a4b498ea",
                            "sender_id": "5f6e2d65afce8e1078f429fd",
                            "receiver_id": "5f67ac2e9a599b177fba55b5",
                            "message": "hi",
                            "createdAt": "2020-09-29T00:23:01.054Z",
                            "updatedAt": "2020-09-29T00:23:01.054Z"
                        }
                    ],
                    "task": [
                        {
                            "_id": "5f6ae1daa31dc3228c3f6ab5",
                            "title": "Tap Repair"
                        }
                    ],
                    "consumer": [
                        {
                            "_id": "5f6e2d65afce8e1078f429fd",
                            "name": "Captain America",
                            "mobile": "919804985304",
                            "address": "india",
                            "profile_picture": "/images/1601056101315.jpg"
                        }
                    ],
                    "provider": [
                        {
                            "_id": "5f67ac2e9a599b177fba55b5",
                            "name": "Demo",
                            "mobile": "919903614706",
                            "address": "india",
                            "profile_picture": "/images/1601090029587.jpg"
                        }
                    ]
                }
            ]
        }
     *
     *
     */

    GetChatList: async (req, res, next) => {
        try {
            const id = req.user_id || ''

            let validateError = null
            if (id == '')
                validateError = 'Invalid id.'

            if (validateError)
                return HandleError(res, validateError)

            const query = [
                { $match: { $or: [{ provider_id: Mongoose.Types.ObjectId(id) }, { consumer_id: Mongoose.Types.ObjectId(id) }] } },
                {
                    $lookup:
                        { from: 'tasks', localField: 'task_id', foreignField: '_id', as: 'task' }
                },
                {
                    $lookup:
                        { from: 'users', localField: 'consumer_id', foreignField: '_id', as: 'consumer' }
                },
                {
                    $lookup:
                        { from: 'users', localField: 'provider_id', foreignField: '_id', as: 'provider' }
                },
                {
                    $lookup:
                        { from: 'reviews', localField: 'provider_id', foreignField: 'provider', as: 'reviews' }
                },
                {
                    $project: {
                        _id: 1,
                        consumer_id: 1,
                        provider_id: 1,
                        lastchat: { $slice: ["$chats", -1] },
                        task: { _id: 1, title: 1, status: 1 },
                        average_rating: { $avg: '$reviews.rating' },
                        consumer: {
                            _id: 1,
                            name: 1,
                            mobile: 1,
                            address: 1,
                            profile_picture: 1
                        },
                        provider: {
                            _id: 1,
                            name: 1,
                            mobile: 1,
                            address: 1,
                            provider: {service: 1},
                            profile_picture: 1
                        }
                    }
                }
            ]

            let data = await Aggregate(Chat, query)
            if (!data.length)
                return HandleError(res, 'No Data Found.')
            return HandleSuccess(res, data)

        } catch (err) {
            HandleServerError(res, req, err)
        }
    },

    /**
     * @api {put} /consumer/startinterview Start Interview
     * @apiName Start Interview
     * @apiGroup Chat
     *
     * @apiParam {ObjectId} id Id of the user.
     * @apiParam {ObjectId} task_id Id of the task.
     * @apiParam {ObjectId} proposal_id Id of the proposal.
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
        {
            "status": "success",
            "data": {
                "_id": "5f7295f882b2a92da43a6587",
                "consumer_id": "5f6e2d65afce8e1078f429fd",
                "provider_id": "5f67ac2e9a599b177fba55b5",
                "task_id": "5f6ae1daa31dc3228c3f6ab5",
                "chats": [
                    {
                        "images": [],
                        "seen": false,
                        "_id": "5f7295f882b2a92da43a6588",
                        "sender_id": "5f6e2d65afce8e1078f429fd",
                        "receiver_id": "5f67ac2e9a599b177fba55b5",
                        "message": "hi",
                        "createdAt": "2020-09-29T02:03:36.517Z",
                        "updatedAt": "2020-09-29T02:03:36.517Z"
                    }
                ],
                "createdAt": "2020-09-29T02:03:36.518Z",
                "updatedAt": "2020-09-29T02:03:36.518Z",
                "__v": 0
            }
        }
        
     *
     *
     */

    StartInterview: async (req, res, next) => {
        try {
            const { task_id = '', proposal_id = '' } = req.body
            const id = req.user_id || ''

            let validateError = null
            if (id == '')
                validateError = 'Invalid id.'
            else if (task_id == '')
                validateError = 'Invalid task id.'
            else if (proposal_id == '')
                validateError = 'Invalid proposal id.'

            if (validateError)
                return HandleError(res, validateError)

            // find the cover letter
            const query = [
                { $match: { _id: Mongoose.Types.ObjectId(task_id) } },
                {
                    $project: {
                        proposals: {
                            $filter: {
                                input: '$proposals',
                                as: 'proposal',
                                cond: { $eq: ['$$proposal._id', Mongoose.Types.ObjectId(proposal_id)] }
                            }
                        },
                    }
                }
            ]
            const result = await Aggregate(Task, query)
            if (!result.length)
                return HandleError(res, 'Proposal Not Found.')

            const provider_id = result[0].proposals[0].provider
            const proposal_letter = result[0].proposals[0].cover_letter
            const is_already_interviewed = result[0].proposals[0].interviewed

            const isProviderExists = await IsExists(User, { _id: provider_id, is_switched_provider: true })
            if (!isProviderExists)
                return HandleError(res, 'Provider doesn\'t exists.')

            if (!is_already_interviewed) {
                const where = { _id: task_id, 'proposals._id': proposal_id }
                const query2 = { 'proposals.$.interviewed': true }

                let updated = await FindAndUpdate(Task, where, query2)
                if (!updated)
                    return HandleError(res, 'Failed to start interview.')

                let data = {
                    consumer_id: id, provider_id: provider_id, task_id: task_id, chats: {
                        sender_id: provider_id,
                        receiver_id: id,
                        message: proposal_letter
                    }
                }
                let inserted = await Insert(Chat, data)
                if (!inserted)
                    return HandleError(res, 'Failed to Start Interview. Please contact system admin.')
            }

            // send chat data
            const chatquery = [
                {
                    $match: {
                        $and: [
                            { consumer_id: Mongoose.Types.ObjectId(id) },
                            { provider_id: Mongoose.Types.ObjectId(provider_id) },
                            { task_id: Mongoose.Types.ObjectId(task_id) },
                        ]
                    }
                },
                {
                    $lookup:
                        { from: 'reviews', localField: 'provider_id', foreignField: 'provider', as: 'reviews' }
                },
                {
                    $lookup:
                        { from: 'tasks', localField: 'task_id', foreignField: '_id', as: 'tasks' }
                },
                {
                    $project: {
                        _id: 1,
                        consumer_id: 1,
                        provider_id: 1,
                        task_id: 1,
                        average_rating: { $avg: '$reviews.rating' },
                        tasks: { _id: 1, title: 1, service: 1, status: 1 },
                        provider_profile_img: isProviderExists[0].profile_picture,
                        provider_name: isProviderExists[0].name,
                        provider_service: isProviderExists[0].provider.service,
                    }
                }
            ]
            const chatresult = await Aggregate(Chat, chatquery)
            if (!chatresult.length)
                return HandleError(res, 'Failed to fetch chat.')

            return HandleSuccess(res, chatresult[0])

        } catch (err) {
            HandleServerError(res, req, err)
        }
    },

    /**
     * @api {post} /chat/sendimage Send Image
     * @apiName Send Image
     * @apiGroup Chat
     *
     * @apiParam {Files} images List of images.
     *
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
        
     *
     *
     */

    SendImage: async (req, res, next) => {
        try {
            const files = req.files ? req.files.images : null
            let images = null
            if(!(files instanceof Array)){
                images=[]
                images.push(files)
            }
            else
                images = files
            var paths = []
            
            for(const item of images){
                let isUploaded = await CompressImageAndUpload(item)
                if (!isUploaded)
                    return HandleError(res, "Failed to upload images.")
                paths.push(isUploaded.path)
            }

            console.log(paths)
            
            return HandleSuccess(res, paths)

        } catch (err) {
            HandleServerError(res, req, err)
        }
    },
    
}


