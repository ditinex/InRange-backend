const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Task = Controllers.Task

router.post('/createtask',Task.CreateTask);


module.exports = router;