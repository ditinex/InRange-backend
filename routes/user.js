const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const User = Controllers.User
const Chat = Controllers.Chat

router.put('/changeprofilepic',User.ChangeProfilePic);
router.put('/switchprofile',User.SwitchProfile);
router.put('/editproviderprofile',User.EditProviderProfile);
router.put('/editprofile',User.EditProfile);
router.put('/updatelocation',User.UpdateLocation);
router.get('/get-notification-list',User.GetNotificationList);
router.get('/unread-notification-count',User.UnreadNotificationCount);
router.put('/update-push-token',User.UpdatePushToken);

module.exports = router;