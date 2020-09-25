const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const { Admin, Otp, User, Task, Mongoose, Review, Coupon } = require('../models')

const {
	IsExists, Insert, Find, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, GeneratePassword
} = require('./baseController');
const { query } = require('express');


module.exports = {
	
}


