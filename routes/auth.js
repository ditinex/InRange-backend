const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Auth = Controllers.Auth

router.post('/signup',Auth.Signup);
router.post('/login',Auth.Login);

module.exports = router;