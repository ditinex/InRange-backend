const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Auth = Controllers.Auth

router.post('/signup',Auth.Signup);
router.post('/editprofile',Auth.EditProfile);
router.post('/login',Auth.Login);
router.put('/updatepushtoken',Auth.UpdatePushToken);
router.get('/refresh-token/:mobile/:token',Auth.RefreshToken);
router.get('/login-by-token/:mobile/:token',Auth.LoginByToken);

module.exports = router;