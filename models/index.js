const mongoose = require('mongoose');

exports.User = require('./UserModel');
exports.Admin = require('./AdminModel');
exports.App = require('./AppModel');
exports.Otp = require('./OtpModel');
exports.Task = require('./TaskModel');
exports.Review = require('./ReviewModal');
exports.Coupon = require('./CouponModel');
exports.Chat = require('./ChatModel');
exports.Notification = require('./NotificationModel');
exports.Transaction = require('./TransactionModel');
exports.Mongoose = mongoose;