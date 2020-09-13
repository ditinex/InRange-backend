const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');

const { 
	Insert, Find,
	HandleSuccess, HandleError, HandleServerError,ValidateEmail
} = require('./baseController');



exports.Signup = async (req,res,next)=>{
	try{
		let name = req.body.name || ''
    	let email = req.body.email || ''
    	let password = req.body.password || ''
    	let type = req.body.type || ''
    	email = email.toLowerCase()
    	let validateError = null
    	if(!validateEmail(email))
			validateError = 'Invalid Email.'
    	else if(name=='' || type=='' || password=='')
    		validateError = 'All fields are required.'
    	const data = { name: name, email: email,password: password, type: type }
        let inserted = await Insert(User,data)
        if(inserted){
            inserted = {... inserted._doc}   
            delete inserted.password
            delete inserted.__v
            return HandleSuccess(res,inserted)
        }
        else
        	return HandleError(res,'Email already exists.')


    } catch (err) {
        errLog = {module: 'Signup', params: req.params, query: req.query, post: req.body, error: err}
    	HandleServerError(res, errLog, 'Failed to signup.')
        next(err);
    }

}

exports.Login= async (req,res,next)=>{
	 try {
    	let email = req.body.email || ''
    	let password = req.body.password || ''
    	email = email.toLowerCase()
    	let validateError = null

    	if(email=='' || password=='')
    		validateError='Fields can not be empty.'

        if(validateError)
        	return HandleError(res,validateError)

		const where = {'email': email}
        let doc = await Find(User,where)
        if(doc.length > 0){
        	doc = doc[0]
        	if( await bcrypt.compare(password,doc.password) == true){	//if password matches
        		//Creating access token.
        		doc.token = jwt.sign({ id: doc._id, role: doc.type }, Config.secret, {
			      expiresIn: 86400 // 86400 expires in 24 hours
			    });
			    delete doc.password
			    delete doc.__v
			    return HandleSuccess(res,doc)
        	}
        	else
        		return HandleError(res,'Incorrect Password.')
        }
        else
        	return HandleError(res,'User does not exists.')


    } catch (err) {
        errLog = {module: 'Login', params: req.params, query: req.query, post: req.body, error: err}
    	HandleServerError(res, errLog, 'Failed to login. Unexpected error.')
        next(err);
    }
	
}


