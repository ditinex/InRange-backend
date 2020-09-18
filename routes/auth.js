const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Auth = Controllers.Auth

router.post('/signup',Auth.AdminSignup);
router.post('/login',Auth.AdminLogin);


module.exports = router;