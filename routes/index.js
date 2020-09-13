const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
//const { VerifyToken } = require('../middlewares');
const { Signup, Login } = Controllers.Auth

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

router.post('/signup',Signup);
router.post('/login',Login);

module.exports = router;