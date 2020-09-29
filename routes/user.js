const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const User = Controllers.User
const Chat = Controllers.Chat

router.post('/changeprofilepic',User.ChangeProfilePic);
router.post('/switchprofile',User.SwitchProfile);
router.post('/editproviderprofile',User.EditProviderProfile);
router.post('/editprofile',User.EditProfile);
router.post('/getchatlist',Chat.GetChatList);
router.post('/startinterview',Chat.StartInterview);



module.exports = router;