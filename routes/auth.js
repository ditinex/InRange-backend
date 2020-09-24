const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Auth = Controllers.Auth

router.post('/signup',Auth.Signup);
router.post('/login',Auth.Login);
router.get('/refresh-token/:mobile/:token',Auth.RefreshToken);

module.exports = router;