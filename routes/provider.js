const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Task = Controllers.Task

router.post('/sendproposal',Task.SendProposal);
router.post('/gettasks',Task.GetTasksProvider);
router.post('/gettaskbyid',Task.GetTaskById);



module.exports = router;