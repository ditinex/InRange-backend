const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const User = Controllers.User
const Chat = Controllers.Chat
const Transaction = Controllers.Transaction

router.put('/changeprofilepic',User.ChangeProfilePic);
router.put('/switchprofile',User.SwitchProfile);
router.put('/editproviderprofile',User.EditProviderProfile);
router.put('/editprofile',User.EditProfile);
router.put('/updatelocation',User.UpdateLocation);
router.get('/get-notification-list',User.GetNotificationList);
router.get('/unread-notification-count',User.UnreadNotificationCount);
router.put('/update-push-token',User.UpdatePushToken);
router.post('/add-transaction',Transaction.AddTransaction);
router.get('/get-transactions',Transaction.GetTransactionList);

module.exports = router;