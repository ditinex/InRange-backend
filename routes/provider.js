const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Task = Controllers.Task

router.post('/sendproposal',Task.SendProposal);
router.post('/sendreview',Task.SendReview);


module.exports = router;