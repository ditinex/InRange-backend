const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Auth = Controllers.Auth
const Coupon = Controllers.Coupon

router.post('/signup',Auth.AdminSignup);
router.post('/login',Auth.AdminLogin);

router.post('/createcoupon',Coupon.CreateCoupon);
router.post('/deletecoupon',Coupon.DeleteCoupon);
router.post('/editcoupon',Coupon.EditCoupon);
router.get('/getallcoupon',Coupon.GetAllCoupons);

module.exports = router;