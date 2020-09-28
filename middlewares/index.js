const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const { UnauthorizedError, IsExists } = require('../controllers/baseController')
const { Admin, Otp, User, Task, Mongoose, Review } = require('../models')

const VerifyToken = (req, res, next) => {
	try{
		if(typeof req.headers.authorization !== "undefined") {
			let token = req.headers.authorization.split(" ")[1];
	        jwt.verify(token, Config.secret, async(err, user) => {
				console.log(user)
	        	if(err)
					return UnauthorizedError(res)
				const isUserExists = await IsExists(User,{_id: user.id, access_token: token})
				if(!isUserExists)
					return UnauthorizedError(res)
				req.user_id = user.id
				req.mobile = user.mobile
				req.name = user.name
	        	next()
	        });
	    }
	    else
	    	return UnauthorizedError(res)
	}
	catch(err){
		HandleServerError(res, req, err)
	}

}




exports.VerifyToken = VerifyToken