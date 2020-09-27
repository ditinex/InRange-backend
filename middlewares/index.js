const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const { UnauthorizedError } = require('../controllers/baseController')

const VerifyToken = (req, res, next) => {
	try{
		if(typeof req.headers.authorization !== "undefined") {
	        let token = req.headers.authorization.split(" ")[1];
	        jwt.verify(token, Config.secret, (err, user) => {
	        	if(err)
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