const express = require('express');
const router = express.Router();

const Controllers = require('../controllers');
const Task = Controllers.Task
const Admin = Controllers.Admin
const Chat = Controllers.Chat

router.post('/createtask',Task.CreateTask);
router.delete('/deletetask',Task.DeleteTask);
router.get('/gettasks',Task.GetTasksConsumer);
router.get('/gettaskbyid',Task.GetTaskById);
router.post('/sendreview',Task.SendReview);
router.put('/acceptproposal',Task.AcceptProposal);
router.get('/getcouponbycode',Admin.GetCouponByCode);
router.put('/startinterview',Chat.StartInterview);

module.exports = router;