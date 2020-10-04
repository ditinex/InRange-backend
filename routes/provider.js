const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Task = Controllers.Task

router.put('/sendproposal',Task.SendProposal);
router.get('/gettasks',Task.GetTasksProvider);
router.get('/gettaskbyid',Task.GetTaskById);



module.exports = router;