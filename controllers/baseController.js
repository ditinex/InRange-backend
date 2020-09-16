const fs = require('fs');
const sharp = require('sharp');
const Config = require('../config.js');


/*
 * Database CURD methods below
 *
 */

const Insert = async (model, data) => {
	try{
		let inserted = await new model(data).save()
		return inserted
	}
	catch(e){
		console.log(e)
		return false
	}
}

const Find = async (model, where, select=null, sort=null, limit=null,skip=null,populate=null, populateField=null) => {
	try{
		let query = model.find(where)
		if(select)
			query.select(select)
		if(sort)
			query.sort(sort)
		if(skip)
			query.skip(skip)
		if(limit)
			query.limit(limit)
		if(populate && populateField)
			query.populate(populate,populateField)
		else if(populate)
			query.populate(populate)
		let doc = await query.lean().exec()
		return doc
	}
	catch(e){
		console.log(e)
		return false
	}
}


/*
 * Other internal methods below
 *
 */

const ValidateEmail = email => {
	let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
	return re.test(String(email).toLowerCase());
}

const PasswordStrength = password => {
	let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.{8,24})(?=.*[0-9])(?=.*[@$!%*#?&])/
	return re.test(password);
}

/*
 * Error Handling methods below
 *
 */

const HandleSuccess = (res, data) => {
	res.status(200).json({
		status: 'success',
		data: data
	});
	res.end();
}

const HandleError = (res,message) => {
	res.status(202).json({
		status: 'failed',
		error: message
	});
	res.end();
}

const UnauthorizedError = (res) => {
	res.status(401).json({
		status: 'failed',
		error: 'Unauthorized API call.'
	});
	res.end();
}

const HandleServerError = (res,req,err) => {
	/*
     * Can log the error data into files to recreate and fix issue.
     * Hiding stack stace from users.
     */
	const errLog = {method: req.method, url: req.originalUrl, params: req.params, query: req.query, post: req.body, error: err }
	// Temporary console log for debug mode
    console.log(errLog)
	res.status(500).json({
		status: 'failed',
		error: 'Something went wrong. Please contact support team.'
	});
}


exports.Insert = Insert
exports.Find = Find
exports.ValidateEmail=ValidateEmail
exports.PasswordStrength = PasswordStrength
exports.UnauthorizedError = UnauthorizedError
exports.HandleServerError = HandleServerError
exports.HandleError = HandleError
exports.HandleSuccess = HandleSuccess