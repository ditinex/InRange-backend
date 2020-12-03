const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Task = Controllers.Task
const User = Controllers.User

router.put('/sendproposal',Task.SendProposal);
router.get('/gettasks',Task.GetTasksProvider);
router.get('/gettaskbyid',Task.GetTaskById);
router.post('/set-cost',Task.SetCost);
router.post('/done-task',Task.DoneTask);
router.get('/get-review-list',User.GetReviewList);


module.exports = router;