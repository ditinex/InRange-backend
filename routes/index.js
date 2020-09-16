const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
//const { VerifyToken } = require('../middlewares');
const Auth = Controllers.Auth

router.use((req, res, next)=>{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	if ('OPTIONS' == req.method) {
      res.sendStatus(200);
    }
    else {
      next();
    }
});

router.post('/admins/signup',Auth.AdminSignup);
router.post('/admins/login',Auth.AdminLogin);

module.exports = router;