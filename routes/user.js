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
router.get('/getchatlist',Chat.GetChatList);
router.put('/startinterview',Chat.StartInterview);
router.post('/sendimage',Chat.SendImage);



module.exports = router;