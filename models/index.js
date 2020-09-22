const mongoose = require('mongoose');

exports.User = require('./UserModel');
exports.Admin = require('./AdminModel');
exports.Otp = require('./OtpModel');
exports.Task = require('./TaskModel');
exports.Mongoose = mongoose;