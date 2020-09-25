const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Auth = Controllers.Auth
const Admin = Controllers.Admin

router.post('/signup',Auth.AdminSignup);
router.post('/login',Auth.AdminLogin);

router.post('/createcoupon',Admin.CreateCoupon);
router.post('/deletecoupon',Admin.DeleteCoupon);
router.post('/editcoupon',Admin.EditCoupon);
router.get('/getallcoupon',Admin.GetAllCoupons);

module.exports = router;