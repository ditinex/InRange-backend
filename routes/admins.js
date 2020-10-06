const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Auth = Controllers.Auth
const Admin = Controllers.Admin

// admin
router.post('/signup',Admin.AdminSignup);
router.post('/login',Admin.AdminLogin);
router.get('/getalladmin',Admin.GetAllAdmins);
router.delete('/deleteadmin',Admin.DeleteAdmin);

// user
router.get('/getalluser',Admin.GetAllUsers);

// coupon
router.post('/createcoupon',Admin.CreateCoupon);
router.delete('/deletecoupon',Admin.DeleteCoupon);
router.put('/editcoupon',Admin.EditCoupon);
router.get('/getallcoupon',Admin.GetAllCoupons);
router.post('/updateuserstatus',Admin.UpdateUserStatus);

module.exports = router;