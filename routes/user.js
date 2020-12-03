const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const User = Controllers.User
const Transaction = Controllers.Transaction

router.put('/changeprofilepic',User.ChangeProfilePic);
router.put('/switchprofile',User.SwitchProfile);
router.put('/editproviderprofile',User.EditProviderProfile);
router.put('/edit-profile',User.EditProfile);
router.put('/change-mobile',User.ChangeMobile);
router.put('/updatelocation',User.UpdateLocation);
router.get('/get-notification-list',User.GetNotificationList);
router.get('/unread-notification-count',User.UnreadNotificationCount);
router.get('/read-notification',User.ReadNotification);
router.put('/update-push-token',User.UpdatePushToken);
router.post('/add-transaction',Transaction.AddTransaction);
router.post('/do-payment',User.DoPayment);
router.get('/get-transaction-list',Transaction.GetTransactionList);

module.exports = router;