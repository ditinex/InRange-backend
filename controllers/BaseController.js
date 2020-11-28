const fs = require('fs');
const sharp = require('sharp');
const Config = require('../config.js');

/*
 * Database CURD methods below
 *
 */

const IsExists = async (model, where, select = null) => {
	try {
		let query = model.find(where)
		if (select)
			query.select(select)
		let doc = await query.lean().exec()
		if (doc.length > 0)
			return doc
		else
			return false
	}
	catch (e) {
		return false
	}
}

const IsExistsOne = async (model, where, select = null) => {
	try {
		let query = model.findOne(where)
		if (select)
			query.select(select)
		let doc = await query.lean().exec()
		if (doc)
			return doc
		else
			return false
	}
	catch (e) {
		return false
	}
}

const Insert = async (model, data) => {
	try {
		let inserted = await new model(data).save()
		return inserted
	}
	catch (e) {
		console.log(e)
		return false
	}
}

const Find = async (model, where, select = null, sort = null, limit = null, skip = null, populate = null, populateField = null) => {
	try {
		let query = model.find(where)
		if (select)
			query.select(select)
		if (sort)
			query.sort(sort)
		if (skip)
			query.skip(skip)
		if (limit)
			query.limit(limit)
		if (populate && populateField)
			query.populate(populate, populateField)
		else if (populate)
			query.populate(populate)
		let doc = await query.lean().exec()
		return doc
	}
	catch (e) {
		console.log(e)
		return false
	}
}

const FindOne = async (model, where, select = null) => {
	try {
		let query = model.findOne(where)
		if (select)
			query.select(select)
		let doc = await query.lean().exec()
		if (doc)
			return doc
		else
			return false
	}
	catch (e) {
		return false
	}
}

const FindAndUpdate = async (model, filter, update, manual = null) => {
	try {
		let query = model.findOneAndUpdate(filter, { $set: update }, { new: true })
		if (manual)
			query = model.findOneAndUpdate(filter, update, { new: true })
		let doc = await query.exec()
		if (doc)
			return doc
		else
			return false
	}
	catch (e) {
		console.log(e)
		return false
	}
}

const UpdateMany = async (model, filter, update, manual = null) => {
	try {
		let query = model.updateMany(filter, { $set: update })
		if (manual)
			query = model.updateMany(filter, update)
		let doc = await query.exec()
		if (doc)
			return doc
		else
			return false
	}
	catch (e) {
		console.log(e)
		return false
	}
}

const Aggregate = async (model, data) => {
	try {
		let query = model.aggregate(data)
		let doc = await query.exec()
		if (doc)
			return doc
		else
			return false
	}
	catch (e) {
		console.log(e)
		return false
	}
}

const Delete = async (model, filter) => {
	try {
		let query = model.deleteMany(filter)
		let doc = await query.exec()
		if (doc)
			return true
		else
			return false
	}
	catch (e) {
		console.log(e)
		return false
	}
}

const CompressImageAndUpload = async (image) => {
	try {
		let time = new Date().getTime()
		let imagePath = Config.publicImagePath + time + '.jpg'
		//Any error from sharp will automatically handle in catch block returning false.
		let imageInfo = await sharp(image.data).jpeg({
			quality: 90,
			chromaSubsampling: '4:4:4'
		}).toFile(imagePath)
		return {
			path: imagePath.replace(/public/g, ''),
			size: imageInfo.size
		}
	} catch (e) {
		console.log(e)
		return false
	}
}

const DeleteFile = async (filepath) => {
	try {
		let isDeleted = await fs.unlinkSync('public' + filepath)
		return isDeleted
	} catch (e) {
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

const ValidateMobile = mobile => {
	let re = /^\d{11,13}$/
	return re.test(mobile);
}

const ValidateAlphanumeric = text => {
	let re = /^[a-zA-Z0-9\s]+$/
	return re.test(String(text));
}

const ValidateLength = (text, max = 25, min = 1) => {
	return (text.length >= min && text.length <= max) ? true : false;
}

const PasswordStrength = password => {
	let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.{8,24})(?=.*[0-9])(?=.*[@$!%*#?&])/
	return re.test(password);
}

const isDataURL = (s)=>{
	let regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
    return !!s.match(regex);
}

const GeneratePassword = (length = 16) => {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
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

const HandleError = (res, message) => {
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

const HandleServerError = (res, req, err) => {
	/*
	 * Can log the error data into files to recreate and fix issue.
	 * Hiding stack stace from users.
	 */
	const errLog = { method: req.method, url: req.originalUrl, params: req.params, query: req.query, post: req.body, error: err }
	// Temporary console log for debug mode
	console.log(errLog)
	res.status(500).json({
		status: 'failed',
		error: 'Something went wrong. Please contact support team.'
	});
}


exports.IsExists = IsExists
exports.IsExistsOne = IsExistsOne
exports.Insert = Insert
exports.Find = Find
exports.FindOne = FindOne
exports.Delete = Delete
exports.FindAndUpdate = FindAndUpdate
exports.UpdateMany = UpdateMany
exports.Aggregate = Aggregate
exports.CompressImageAndUpload = CompressImageAndUpload
exports.DeleteFile = DeleteFile

exports.ValidateEmail = ValidateEmail
exports.PasswordStrength = PasswordStrength
exports.ValidateAlphanumeric = ValidateAlphanumeric
exports.ValidateMobile = ValidateMobile
exports.ValidateLength = ValidateLength
exports.isDataURL = isDataURL
exports.GeneratePassword = GeneratePassword
exports.UnauthorizedError = UnauthorizedError
exports.HandleServerError = HandleServerError
exports.HandleError = HandleError
exports.HandleSuccess = HandleSuccess