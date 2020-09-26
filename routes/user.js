const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const User = Controllers.User

router.post('/changeprofilepic',User.ChangeProfilePic);
router.post('/switchprofile',User.SwitchProfile);
router.post('/editproviderprofile',User.EditProviderProfile);
router.post('/editprofile',User.EditProfile);



module.exports = router;