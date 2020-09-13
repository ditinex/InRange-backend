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
				req.user_role = user.role
	        	next()
	        });
	    }
	    else
	    	return UnauthorizedError(res)
	}
	catch(err){
		console.log(err)
		errLog = {module: 'VerifyToken', params: req.params, query: req.query, post: req.body, error: err}
    	HandleServerError(res, errLog, '500 Internal server error')
        next(err);
	}

}




exports.VerifyToken = VerifyToken