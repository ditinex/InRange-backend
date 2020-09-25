const express = require('express');
const router = express.Router();

const Controllers = require('../controllers');
const Task = Controllers.Task
const Admin = Controllers.Admin

router.post('/createtask',Task.CreateTask);
router.post('/deletetask',Task.DeleteTask);
router.post('/gettasks',Task.GetTasksConsumer);
router.post('/gettaskbyid',Task.GetTaskById);
router.post('/sendreview',Task.SendReview);
router.post('/acceptproposal',Task.AcceptProposal);
router.get('/getcouponbycode',Admin.GetCouponByCode);

module.exports = router;